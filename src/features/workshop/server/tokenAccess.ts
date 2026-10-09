import type { Sql } from 'postgres';
import { TOKEN_MAX_LENGTH } from '@/config/workshop';
import { findToken, type TokenContext } from '../db/tokens';
import { hashToken, tokenState, type TokenPurpose } from '../domain/tokens';

export type TokenAccess =
  | { state: 'valid'; ctx: TokenContext }
  | { state: 'invalid' | 'expired' | 'used' };

export async function resolveToken(
  db: Sql,
  raw: string | undefined,
  purpose: TokenPurpose,
  now: Date
): Promise<TokenAccess> {
  if (!raw || raw.length > TOKEN_MAX_LENGTH) return { state: 'invalid' };
  const ctx = await findToken(db, hashToken(raw), purpose);
  if (!ctx) return { state: 'invalid' };
  const state = tokenState(ctx, now);
  return state === 'valid' ? { state, ctx } : { state };
}
