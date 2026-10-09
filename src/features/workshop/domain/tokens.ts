import { createHash, randomBytes } from 'node:crypto';
import { DAY_MS, TOKEN_TTL_DAYS } from '@/config/workshop';

export type TokenPurpose = 'manage' | 'feedback' | 'followup';
export type TokenState = 'valid' | 'expired' | 'used';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function tokenExpiry(purpose: TokenPurpose, sessionEndsAt: Date, now: Date): Date {
  switch (purpose) {
    case 'manage':
      return new Date(sessionEndsAt.getTime() + TOKEN_TTL_DAYS.manageAfterEnd * DAY_MS);
    case 'feedback':
      return new Date(now.getTime() + TOKEN_TTL_DAYS.feedback * DAY_MS);
    case 'followup':
      return new Date(now.getTime() + TOKEN_TTL_DAYS.followup * DAY_MS);
  }
}

export function tokenState(t: { expiresAt: Date; usedAt: Date | null }, now: Date): TokenState {
  if (t.usedAt) return 'used';
  return now.getTime() > t.expiresAt.getTime() ? 'expired' : 'valid';
}
