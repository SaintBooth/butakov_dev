'use server';

import type { Sql } from 'postgres';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { CONSENT_VERSION, WORKSHOP_LOCALE } from '@/config/workshop';
import { getDb } from '../db/client';
import { insertConsents } from '../db/consents';
import { cancelPendingEmails } from '../db/emailJobs';
import { cancelRegistration } from '../db/registrations';
import type { TokenContext } from '../db/tokens';
import { consentTextHash } from '../domain/consents';
import { resolveToken } from '../server/tokenAccess';

export type ManageIntent = 'cancel' | 'unsubscribe' | 'revoke';
export interface ManageState {
  done: ManageIntent | null;
  error: string | null;
}

interface RevokeAudit {
  version: string;
  hashes: { marketing: string; portfolio: string; quote: string };
}

const intentSchema = z.enum(['cancel', 'unsubscribe', 'revoke']);

export async function applyManageIntent(
  db: Sql,
  ctx: TokenContext,
  intent: ManageIntent,
  audit: RevokeAudit
): Promise<void> {
  if (intent === 'cancel') {
    await db.begin(async (tx) => {
      await cancelRegistration(tx, ctx.registrationId);
      await cancelPendingEmails(tx, ctx.registrationId);
    });
    return;
  }
  const kinds: (keyof RevokeAudit['hashes'])[] =
    intent === 'unsubscribe' ? ['marketing'] : ['portfolio', 'quote'];
  await insertConsents(
    db,
    kinds.map((kind) => ({
      participantId: ctx.participantId,
      registrationId: ctx.registrationId,
      kind,
      granted: false,
      textVersion: audit.version,
      textSha256: audit.hashes[kind],
      ip: null,
      userAgent: null,
    }))
  );
}

export async function manageAction(
  token: string,
  _prev: ManageState,
  fd: FormData
): Promise<ManageState> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  const db = getDb();
  const intent = intentSchema.safeParse(fd.get('intent'));
  if (!db || !intent.success) return { done: null, error: t('errors.unavailable') };
  const access = await resolveToken(db, token, 'manage', new Date());
  if (access.state !== 'valid') return { done: null, error: t(`token.${access.state}`) };
  await applyManageIntent(db, access.ctx, intent.data, {
    version: CONSENT_VERSION,
    hashes: {
      marketing: consentTextHash(t.raw('consents.marketing') as string),
      portfolio: consentTextHash(t.raw('consents.portfolio') as string),
      quote: consentTextHash(t.raw('consents.quote') as string),
    },
  });
  return { done: intent.data, error: null };
}
