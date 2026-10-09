'use server';

import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import {
  CONSENT_VERSION,
  MAX_STAMP_AGE_MS,
  MIN_FILL_MS,
  RATE_LIMITS,
  WORKSHOP_LOCALE,
} from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { countActiveRegistrations } from '../db/registrations';
import { consentTextHash } from '../domain/consents';
import {
  createRegistrationSchema,
  issuesToFieldErrors,
  readRegistrationForm,
  type FieldErrors,
} from '../schema';
import { guardDb } from '../server/actionGuard';
import { getClientIp } from '../server/clientIp';
import { checkStamp } from '../server/formStamp';
import { notifyOwner } from '../server/notify';
import { createRateLimiter } from '../server/rateLimit';
import { registerParticipant } from '../server/registerParticipant';

export type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; fieldErrors: FieldErrors; formError: string | null };

const attemptsByPerson = createRateLimiter(RATE_LIMITS.register);
const attemptsByIp = createRateLimiter(RATE_LIMITS.registerIp);
const formError = (message: string): FormState => ({
  status: 'error',
  fieldErrors: {},
  formError: message,
});

export async function registerAction(
  slug: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db) return formError(t('errors.unavailable'));

  // Bots get a fake success so they learn nothing about the filter.
  if (fd.get('website')) return { status: 'success' };
  const stamp = checkStamp(
    String(fd.get('stamp') ?? ''),
    env.WORKSHOP_FORM_SECRET,
    Date.now(),
    MIN_FILL_MS,
    MAX_STAMP_AGE_MS
  );
  if (stamp === 'too_fast') return { status: 'success' };
  if (stamp === 'invalid') return formError(t('errors.reload'));

  const h = await headers();
  const ip = getClientIp(h, env.WORKSHOP_IP_HEADER);

  const parsed = createRegistrationSchema(t).safeParse(readRegistrationForm(fd));
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
      formError: null,
    };
  }

  // The spec cap (5 per 10 minutes) is per person; the higher per-ip cap lets colleagues behind
  // one NAT register while still bounding a single address that rotates emails.
  // The hit is taken before any await: check-then-hit across a database round trip would let a
  // parallel burst slip past the limiter. It is refunded below when the database fails.
  const personKey = ip ? `${ip}:${parsed.data.email}` : null;
  if (ip && personKey) {
    if (attemptsByPerson.isLimited(personKey) || attemptsByIp.isLimited(ip)) {
      return formError(t('errors.rateLimited'));
    }
    attemptsByPerson.hit(personKey);
    attemptsByIp.hit(ip);
  }

  const outcome = await guardDb(
    'register',
    () => null,
    () =>
      registerParticipant(
        db,
        slug,
        parsed.data,
        {
          version: CONSENT_VERSION,
          hashes: {
            pd_processing: consentTextHash(t.raw('consents.pd') as string),
            marketing: consentTextHash(t.raw('consents.marketing') as string),
            portfolio: consentTextHash(t.raw('consents.portfolio') as string),
          },
          ip,
          userAgent: h.get('user-agent'),
        },
        new Date()
      )
  );
  if (!outcome) {
    // An outage must not burn the visitor's retry budget.
    if (ip && personKey) {
      attemptsByPerson.refund(personKey);
      attemptsByIp.refund(ip);
    }
    return formError(t('errors.unavailable'));
  }
  if (outcome.status === 'full') return formError(t('errors.full'));
  if (outcome.status !== 'ok') return formError(t('errors.closed'));

  // The registration is already saved: a failing counter must not turn it into an error page.
  const count = await guardDb(
    'register count',
    () => null,
    () => countActiveRegistrations(db, outcome.sessionId)
  );
  if (count !== null) await notifyOwner(env, t('notify.registered', { slug, count }));
  return { status: 'success' };
}
