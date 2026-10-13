import { isAnalyticsDisabledPath } from '@/config/analytics';

/**
 * Umami's `data-before-send` hook: returning null cancels the hit. Token and admin pages
 * carry a bearer token in the URL, so their hits must never reach the stats database.
 */
export function filterUmamiPayload<T extends { url?: string; [key: string]: unknown }>(
  payload: T | null,
  origin: string
): T | null {
  if (!payload?.url) return payload;
  return isAnalyticsDisabledPath(new URL(payload.url, origin).pathname) ? null : payload;
}
