export const YM_ID = 107722106;

// Pages whose query string carries a bearer token (?t=...): Metrika records the full URL,
// so a token sent there would grant access to a participant's data.
export const NO_ANALYTICS_PATH_PATTERNS: readonly RegExp[] = [
  /^\/[a-z]{2}\/workshop\/(manage|feedback|followup)\/?$/,
];

export function isAnalyticsDisabledPath(pathname: string): boolean {
  return NO_ANALYTICS_PATH_PATTERNS.some((p) => p.test(pathname));
}
