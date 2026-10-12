import type { Sql, TransactionSql } from 'postgres';
import { RATE_LIMITS } from '@/config/workshop';
import { findSessionBySlug, type WorkshopSession } from '../db/sessions';
import { findViewLinkSession } from '../db/viewLinks';
import { createRateLimiter, type RateLimiter } from './rateLimit';

// On globalThis: the export route and the admin page are separate bundles but must share one failure budget.
const globals = globalThis as typeof globalThis & { __workshopViewLinkFailures?: RateLimiter };

export function viewLinkFailures(): RateLimiter {
  return (globals.__workshopViewLinkFailures ??= createRateLimiter(RATE_LIMITS.export));
}

export function resetViewLinkFailures(): void {
  delete globals.__workshopViewLinkFailures;
}

/**
 * Session behind a view-link token, or null. A limited ip is refused before any lookup;
 * an unknown slug and a foreign or expired token look the same and spend the ip's budget.
 */
export async function checkViewLink(
  db: Sql | TransactionSql,
  slug: string,
  token: string,
  ip: string | null,
  now: Date
): Promise<WorkshopSession | null> {
  const failures = viewLinkFailures();
  if (ip && failures.isLimited(ip)) return null;
  const session = await findSessionBySlug(db, slug);
  const linked = await findViewLinkSession(db, token, now);
  if (!session || linked !== session.id) {
    if (ip) failures.hit(ip);
    return null;
  }
  return session;
}
