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
import { getClientIp } from '../server/clientIp';
import { checkStamp } from '../server/formStamp';
import { notifyOwner } from '../server/notify';
import { createRateLimiter } from '../server/rateLimit';
import { registerParticipant } from '../server/registerParticipant';

export type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; fieldErrors: FieldErrors; formError: string | null };

const allow = createRateLimiter(RATE_LIMITS.register);
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
  if (ip && !allow(ip)) return formError(t('errors.rateLimited'));

  const parsed = createRegistrationSchema(t).safeParse(readRegistrationForm(fd));
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
      formError: null,
    };
  }

  const outcome = await registerParticipant(
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
  );

  if (outcome.status === 'full') return formError(t('errors.full'));
  if (outcome.status !== 'ok') return formError(t('errors.closed'));

  const count = await countActiveRegistrations(db, outcome.sessionId);
  await notifyOwner(env, t('notify.registered', { slug, count }));
  return { status: 'success' };
}
