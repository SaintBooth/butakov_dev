import type { Sql } from 'postgres';
import { TOKEN_MAX_LENGTH } from '@/config/workshop';
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
  return state === 'valid' ? { state, ctx } : { state };
}
