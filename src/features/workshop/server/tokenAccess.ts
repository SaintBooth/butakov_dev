import type { Sql } from 'postgres';
import { TOKEN_MAX_LENGTH } from '@/config/workshop';
import { hasResponse } from '../db/responses';
import { findToken, type TokenContext } from '../db/tokens';
import { hashToken, tokenState, type TokenPurpose } from '../domain/tokens';

export type TokenAccess =
  | { state: 'valid'; ctx: TokenContext }
  | { state: 'invalid' | 'expired' | 'used' };

export async function resolveToken(
  db: Sql,
  raw: unknown,
  purpose: TokenPurpose,
  now: Date
): Promise<TokenAccess> {
  // Next.js can pass ?t=a&t=b as string[], which would crash hashToken (500).
  if (typeof raw !== 'string' || !raw || raw.length > TOKEN_MAX_LENGTH) return { state: 'invalid' };
  const ctx = await findToken(db, hashToken(raw), purpose);
  if (!ctx) return { state: 'invalid' };
  const state = tokenState(ctx, now);
  if (state !== 'valid') return { state };
  // A participant can hold two valid tokens (check-in and the emailed one); once the answer
  // exists the other one must say so instead of showing a form that fails on submit.
  if (purpose !== 'manage' && (await hasResponse(db, ctx.registrationId, purpose))) {
    return { state: 'used' };
  }
  return { state, ctx };
}

// Next passes a repeated ?t=a&t=b as string[]; the bound server action needs a plain string.
export function tokenFromParam(raw: string | string[] | undefined): string {
  return typeof raw === 'string' ? raw : '';
}
