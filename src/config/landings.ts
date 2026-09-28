export const SITE_URL = 'https://butakov.dev';

/** Service landing slugs per locale: RU transliterated (matches Yandex queries), EN plain English. */
export const LANDING_SLUGS = {
  'web-dev': { ru: 'razrabotka-saytov', en: 'web-development' },
  'web-apps': { ru: 'razrabotka-veb-prilozheniy', en: 'web-app-development' },
  support: { ru: 'podderzhka-saytov', en: 'website-support' },
  ai: { ru: 'vnedrenie-ii', en: 'ai-integration' },
} as const;

export type LandingId = keyof typeof LANDING_SLUGS;
export type LandingLocale = 'ru' | 'en';

export const LANDING_IDS = Object.keys(LANDING_SLUGS) as LandingId[];

export function isLandingLocale(locale: string): locale is LandingLocale {
  return locale === 'ru' || locale === 'en';
}

export function findLandingBySlug(locale: LandingLocale, slug: string): LandingId | undefined {
  return LANDING_IDS.find((id) => LANDING_SLUGS[id][locale] === slug);
}

/** Locale-relative path, for next-intl `Link` (it adds the /ru prefix itself). */
export function landingPath(id: LandingId, locale: LandingLocale): string {
  return `/${LANDING_SLUGS[id][locale]}`;
}

/** Absolute URL, for canonical / hreflang / sitemap / JSON-LD. */
export function landingUrl(id: LandingId, locale: LandingLocale): string {
  const prefix = locale === 'ru' ? '/ru' : '';
  return `${SITE_URL}${prefix}/${LANDING_SLUGS[id][locale]}`;
}
