'use server';

import type { Sql } from 'postgres';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { RATE_LIMITS, WORKSHOP_LOCALE, WORKSHOP_PATHS } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { markAttended } from '../db/registrations';
import { hasResponse } from '../db/responses';
import { findSessionBySlug } from '../db/sessions';
import { issueToken } from '../db/tokens';
import { codesMatch, isCheckinOpen } from '../domain/checkin';
import {
  createCheckinSchema,
  issuesToFieldErrors,
  readCheckinForm,
  type CheckinInput,
} from '../schema';
import { guardDb } from '../server/actionGuard';
import { getClientIp } from '../server/clientIp';
import { createRateLimiter } from '../server/rateLimit';
import type { FormState } from './register';

export type CheckinResult =
  | { status: 'ok'; feedbackToken: string }
  | { status: 'closed' | 'not_found' | 'already_answered' };

// The feedback URL carries a token, so it is handed to the client for a full page load instead of
// redirect(): a soft navigation would let the already-initialised Metrika record the token URL.
export type CheckinState =
  | FormState
  | { status: 'checked_in'; feedbackUrl: string }
  | { status: 'already_answered' };

// Only failed code guesses are counted, so attendees who check in correctly never spend budget.
const failuresByPerson = createRateLimiter(RATE_LIMITS.checkin);
const failuresByIp = createRateLimiter(RATE_LIMITS.checkinIp);

export async function checkIn(
  db: Sql,
  slug: string,
  input: CheckinInput,
  now: Date
): Promise<CheckinResult> {
  const session = await findSessionBySlug(db, slug);
  if (!session) return { status: 'not_found' };
  if (!isCheckinOpen(session.endsAt, now)) return { status: 'closed' };
  if (!codesMatch(input.code, session.checkinCode)) return { status: 'not_found' };
  const registrationId = await markAttended(db, session.id, input.email, now);
  if (!registrationId) return { status: 'not_found' };
  // Tokens are stored hashed, so an earlier one cannot be handed out again; a repeat check-in
  // after the answer was given must not mint another working link.
  if (await hasResponse(db, registrationId, 'feedback')) return { status: 'already_answered' };
  const feedbackToken = await issueToken(db, registrationId, 'feedback', session.endsAt, now);
  return { status: 'ok', feedbackToken };
}

export async function checkinAction(
  slug: string,
  _prev: CheckinState,
  fd: FormData
): Promise<CheckinState> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  const env = getWorkshopEnv();
  const db = getDb();
  const fail = (message: string): CheckinState => ({
    status: 'error',
    fieldErrors: {},
    formError: message,
  });
  if (!env || !db) return fail(t('errors.unavailable'));

  const ip = getClientIp(await headers(), env.WORKSHOP_IP_HEADER);

  const parsed = createCheckinSchema(t).safeParse(readCheckinForm(fd));
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
      formError: null,
    };
  }

  // Keyed by ip and email so one person guessing codes is throttled, while a room of
  // attendees behind a single NAT address is not locked out together. The per-ip cap is
  // higher and stops rotating emails from brute-forcing the code.
  const personKey = `${ip}:${parsed.data.email}`;
  if (ip && (failuresByPerson.isLimited(personKey) || failuresByIp.isLimited(ip))) {
    return fail(t('errors.rateLimited'));
  }

  return guardDb(
    'checkin',
    () => fail(t('errors.unavailable')),
    async () => {
      const result = await checkIn(db, slug, parsed.data, new Date());
      if (result.status === 'closed') return fail(t('checkin.closed'));
      if (result.status === 'already_answered') return { status: 'already_answered' };
      if (result.status === 'not_found') {
        if (ip) {
          failuresByPerson.hit(personKey);
          failuresByIp.hit(ip);
        }
        return fail(t('checkin.notFound'));
      }
      if (result.status !== 'ok') return fail(t('errors.unavailable'));
      return { status: 'checked_in', feedbackUrl: WORKSHOP_PATHS.feedback(result.feedbackToken) };
    }
  );
}
