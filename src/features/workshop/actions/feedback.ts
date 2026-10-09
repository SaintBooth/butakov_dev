'use server';

import type { Sql } from 'postgres';
import { getTranslations } from 'next-intl/server';
import { CONSENT_VERSION, WORKSHOP_LOCALE } from '@/config/workshop';
import { getDb } from '../db/client';
import { insertConsents } from '../db/consents';
import { enqueueEmails } from '../db/emailJobs';
import { insertFeedback } from '../db/responses';
import { markTokenUsed, type TokenContext } from '../db/tokens';
import { consentTextHash } from '../domain/consents';
import { followupSendAt } from '../domain/emailPlan';
import {
  createFeedbackSchema,
  issuesToFieldErrors,
  readFeedbackForm,
  type FeedbackInput,
} from '../schema';
import { resolveToken } from '../server/tokenAccess';
import type { FormState } from './register';

export async function saveFeedback(
  db: Sql,
  ctx: TokenContext,
  input: FeedbackInput,
  quoteHash: string,
  now: Date
): Promise<'saved' | 'duplicate'> {
  return db.begin(async (tx) => {
    if (!(await insertFeedback(tx, ctx.registrationId, input))) return 'duplicate' as const;
    await insertConsents(tx, [
      {
        participantId: ctx.participantId,
        registrationId: ctx.registrationId,
        kind: 'quote',
        granted: input.consentQuote,
        textVersion: CONSENT_VERSION,
        textSha256: quoteHash,
        ip: null,
        userAgent: null,
      },
    ]);
    if (input.followupOk) {
      await enqueueEmails(tx, ctx.registrationId, [
        { kind: 'followup', sendAt: followupSendAt(ctx.sessionEndsAt) },
      ]);
    }
    await markTokenUsed(tx, ctx.tokenId, now);
    return 'saved' as const;
  });
}

export async function feedbackAction(
  token: string,
  _prev: FormState,
  fd: FormData
): Promise<FormState> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  const db = getDb();
  const fail = (message: string): FormState => ({
    status: 'error',
    fieldErrors: {},
    formError: message,
  });
  if (!db) return fail(t('errors.unavailable'));
  const access = await resolveToken(db, token, 'feedback', new Date());
  if (access.state !== 'valid') return fail(t(`token.${access.state}`));

  const parsed = createFeedbackSchema(t).safeParse(readFeedbackForm(fd));
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
      formError: null,
    };
  }

  const quoteHash = consentTextHash(t.raw('consents.quote') as string);
  const result = await saveFeedback(db, access.ctx, parsed.data, quoteHash, new Date());
  return result === 'saved' ? { status: 'success' } : fail(t('token.used'));
}
