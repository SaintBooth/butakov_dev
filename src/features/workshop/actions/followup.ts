'use server';

import type { Sql } from 'postgres';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { insertFollowup } from '../db/responses';
import { markTokenUsed, type TokenContext } from '../db/tokens';
import {
  createFollowupSchema,
  issuesToFieldErrors,
  readFollowupForm,
  type FollowupInput,
} from '../schema';
import { guardDb } from '../server/actionGuard';
import { notifyOwner } from '../server/notify';
import { resolveToken } from '../server/tokenAccess';
import type { FormState } from './register';

export async function saveFollowup(
  db: Sql,
  ctx: TokenContext,
  input: FollowupInput,
  now: Date
): Promise<'saved' | 'duplicate'> {
  return db.begin(async (tx) => {
    if (!(await insertFollowup(tx, ctx.registrationId, input))) return 'duplicate' as const;
    await markTokenUsed(tx, ctx.tokenId, now);
    return 'saved' as const;
  });
}

export async function followupAction(
  token: string,
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
  return guardDb(
    'followup',
    () => fail(t('errors.unavailable')),
    async () => {
      const access = await resolveToken(db, token, 'followup', new Date());
      if (access.state !== 'valid') return fail(t(`token.${access.state}`));

      const parsed = createFollowupSchema(t).safeParse(readFollowupForm(fd));
      if (!parsed.success) {
        return {
          status: 'error',
          fieldErrors: issuesToFieldErrors(parsed.error.issues),
          formError: null,
        };
      }

      const result = await saveFollowup(db, access.ctx, parsed.data, new Date());
      if (result === 'duplicate') return fail(t('token.used'));
      if (parsed.data.letterOk) {
        await notifyOwner(
          env,
          t('notify.letterReady', { registrationId: access.ctx.registrationId })
        );
      }
      return { status: 'success' };
    }
  );
}
