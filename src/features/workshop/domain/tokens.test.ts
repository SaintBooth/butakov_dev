import { describe, expect, it } from 'vitest';
import { createToken, hashToken, tokenExpiry, tokenState } from './tokens';

const DAY = 86_400_000;
const now = new Date('2026-10-20T16:00:00Z');
const endsAt = new Date('2026-10-20T15:00:00Z');

describe('tokens', () => {
  it('creates a url-safe token whose hash matches hashToken', () => {
    const { token, hash } = createToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hash).toBe(hashToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('dates manage tokens from the session end, others from now', () => {
    expect(tokenExpiry('manage', endsAt, now).getTime()).toBe(endsAt.getTime() + 60 * DAY);
    expect(tokenExpiry('feedback', endsAt, now).getTime()).toBe(now.getTime() + 14 * DAY);
    expect(tokenExpiry('followup', endsAt, now).getTime()).toBe(now.getTime() + 30 * DAY);
  });

  it('reports used before expired', () => {
    const past = new Date(now.getTime() - 1);
    expect(tokenState({ expiresAt: past, usedAt: past }, now)).toBe('used');
    expect(tokenState({ expiresAt: past, usedAt: null }, now)).toBe('expired');
    expect(tokenState({ expiresAt: now, usedAt: null }, now)).toBe('valid');
  });
});
