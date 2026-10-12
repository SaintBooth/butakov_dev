import { RATE_LIMITS } from '@/config/workshop';
import { createRateLimiter, type RateLimiter } from './rateLimit';

// On globalThis: the export route and the admin page are separate bundles but must share one failure budget.
const globals = globalThis as typeof globalThis & { __workshopViewLinkFailures?: RateLimiter };

export function viewLinkFailures(): RateLimiter {
  return (globals.__workshopViewLinkFailures ??= createRateLimiter(RATE_LIMITS.export));
}
