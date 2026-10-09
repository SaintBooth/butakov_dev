import { timingSafeEqual } from 'node:crypto';
import { RATE_LIMITS } from '@/config/workshop';
import { createRateLimiter } from './rateLimit';

export type GateResult = 'ok' | 'unauthorized' | 'limited';

function tokenMatches(header: string | null, token: string): boolean {
  const given = Buffer.from(header?.replace(/^Bearer /, '') ?? '');
  const expected = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function createAdminGate(limit: { max: number; windowMs: number } = RATE_LIMITS.export) {
  const allow = createRateLimiter(limit);
  // Every attempt is counted before the token is checked: a limiter that only counted failures
  // could not refuse a lucky correct guess made after the budget was already spent.
  return function check(header: string | null, token: string, ip: string | null): GateResult {
    if (ip && !allow(ip)) return 'limited';
    return tokenMatches(header, token) ? 'ok' : 'unauthorized';
  };
}
