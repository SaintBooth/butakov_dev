'use server';

import type { Sql } from 'postgres';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { RATE_LIMITS, WORKSHOP_LOCALE, WORKSHOP_PATHS } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { markAttended } from '../db/registrations';
import { findSessionBySlug } from '../db/sessions';
import { issueToken } from '../db/tokens';
import { codesMatch, isCheckinOpen } from '../domain/checkin';
import {
  createCheckinSchema,
  issuesToFieldErrors,
  readCheckinForm,
  type CheckinInput,
} from '../schema';
import { getClientIp } from '../server/clientIp';
import { createRateLimiter } from '../server/rateLimit';
import type { FormState } from './register';

export type CheckinResult =
  | { status: 'ok'; feedbackToken: string }
  | { status: 'closed' | 'not_found' };

const allow = createRateLimiter(RATE_LIMITS.checkin);

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
  const feedbackToken = await issueToken(db, registrationId, 'feedback', session.endsAt, now);
  return { status: 'ok', feedbackToken };
}

export async function checkinAction(
  slug: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  const env = getWorkshopEnv();
  const db = getDb();
  const fail = (message: string): FormState => ({
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
  // attendees behind a single NAT address is not locked out together.
  if (ip && !allow(`${ip}:${parsed.data.email}`)) return fail(t('errors.rateLimited'));

  const result = await checkIn(db, slug, parsed.data, new Date());
  if (result.status === 'closed') return fail(t('checkin.closed'));
  if (result.status === 'not_found') return fail(t('checkin.notFound'));
  if (result.status !== 'ok') return fail(t('errors.unavailable'));
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect(WORKSHOP_PATHS.feedback(result.feedbackToken));
}
