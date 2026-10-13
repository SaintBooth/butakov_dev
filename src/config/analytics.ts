import { ADMIN_PAGE_PATTERN, TOKEN_PAGES, WORKSHOP_LOCALE } from './workshop';

export const YM_ID = 107722106;

// Self-hosted Umami on stats.butakov.dev. The script and collect paths are renamed on the
// server (TRACKER_SCRIPT_NAME / COLLECT_API_ENDPOINT) so generic blocklists miss them.
export const UMAMI = {
  origin: 'https://stats.butakov.dev',
  scriptPath: '/p.js',
  recorderPath: '/recorder.js',
  websiteId: '920e10b9-bb76-476e-bdc2-770a23f7f9ef',
  domain: 'butakov.dev',
  beforeSendHook: 'umamiBeforeSend',
} as const;

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
