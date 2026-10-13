import { SITE_URL } from './landings';

export const UTM_SOURCES = [
  'yandex',
  'google',
  'vcru',
  'devto',
  'hackernoon',
  'telegram',
  'github',
  'promptspace',
  'vizitka',
  'workshop',
  'email',
] as const;
export const UTM_MEDIUMS = [
  'cpc',
  'article',
  'social',
  'messenger',
  'offline',
  'referral',
  'email',
] as const;
export const UTM_CONTENTS = ['bio', 'inline', 'footer', 'cta'] as const;

export type UtmSource = (typeof UTM_SOURCES)[number];
export type UtmMedium = (typeof UTM_MEDIUMS)[number];
export type UtmContent = (typeof UTM_CONTENTS)[number];

/** Paste into Direct's "URL parameters"; Direct substitutes the {placeholders}. */
export const DIRECT_URL_TEMPLATE =
  'utm_source=yandex&utm_medium=cpc&utm_campaign={campaign_id}&utm_content={ad_id}&utm_term={keyword}';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface TrackedUrlOptions {
  path: string;
  source: UtmSource;
  medium: UtmMedium;
  campaign: string;
  content?: UtmContent;
}

export function buildTrackedUrl({
  path,
  source,
  medium,
  campaign,
  content,
}: TrackedUrlOptions): string {
  if (!SLUG.test(campaign)) throw new Error(`utm_campaign must be a lowercase slug: "${campaign}"`);
  const url = new URL(path, SITE_URL);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}
