import { SITE_URL } from '@/config/landings';

const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * www.butakov.dev used to answer 200 with a full copy of the site; Yandex glues
 * mirrors only by a 301, so every non-canonical www host is sent to the apex.
 * The gateway may self-proxy, hence x-forwarded-host takes priority over host.
 */
export function wwwRedirectTarget(
  hostHeader: string | null,
  forwardedHost: string | null,
  pathAndQuery: string
): string | null {
  const host = (forwardedHost ?? hostHeader ?? '').split(',')[0].trim().toLowerCase();
  if (host !== `www.${CANONICAL_HOST}`) return null;
  return `${SITE_URL}${pathAndQuery}`;
}
