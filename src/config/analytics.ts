import { ADMIN_PAGE_PATTERN, TOKEN_PAGES, WORKSHOP_LOCALE } from './workshop';

export const YM_ID = 107722106;

// Pages whose query string carries a bearer token (?t=...): Metrika records the full URL,
// so a token sent there would grant access to a participant's data. Derived from the same
// list that builds the token URLs, so the two cannot drift apart.
export const NO_ANALYTICS_PATH_PATTERNS: readonly RegExp[] = [
  new RegExp(`^/${WORKSHOP_LOCALE}/workshop/(${TOKEN_PAGES.join('|')})/?$`),
  ADMIN_PAGE_PATTERN,
];

export function isAnalyticsDisabledPath(pathname: string): boolean {
  return NO_ANALYTICS_PATH_PATTERNS.some((p) => p.test(pathname));
}
