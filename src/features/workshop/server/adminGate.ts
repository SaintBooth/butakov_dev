import { timingSafeEqual } from 'node:crypto';
import { RATE_LIMITS } from '@/config/workshop';
import { createRateLimiter } from './rateLimit';

export type GateResult = 'ok' | 'unauthorized' | 'limited';

const BEARER_PREFIX = 'Bearer ';

function tokenMatches(header: string | null, token: string): boolean {
  if (!header?.startsWith(BEARER_PREFIX)) return false;
  const given = Buffer.from(header.slice(BEARER_PREFIX.length));
  const expected = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function createAdminGate(limit: { max: number; windowMs: number } = RATE_LIMITS.export) {
  const failures = createRateLimiter(limit);
  // Only failed attempts are counted, so the owner's correct token never spends budget and a
  // flood of wrong tokens from another address cannot lock the owner out. The budget is checked
  // first: an address that already spent it is refused even when it then guesses right.
  return function check(header: string | null, token: string, ip: string | null): GateResult {
    if (ip && failures.isLimited(ip)) return 'limited';
    if (tokenMatches(header, token)) return 'ok';
    if (ip) failures.hit(ip);
    return 'unauthorized';
  };
}
