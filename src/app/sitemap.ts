import type { MetadataRoute } from 'next';
import { LANDING_IDS, landingUrl, SITE_URL } from '@/config/landings';
import { getAllCaseFrontmatters } from '@/utils/cases';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [casesEn, casesRu] = await Promise.all([
    getAllCaseFrontmatters('en'),
    getAllCaseFrontmatters('ru'),
  ]);
  const enBySlug = new Map(casesEn.map((c) => [c.slug, c]));
  const ruBySlug = new Map(casesRu.map((c) => [c.slug, c]));
  const slugs = new Set([...enBySlug.keys(), ...ruBySlug.keys()]);

  // Most recent case date, used as lastModified for listing pages whose
  // content changes exactly when a new case is published.
  const allDates = [...casesEn, ...casesRu].map((c) => c.frontmatter.date).sort();
  const latestDate = allDates[allDates.length - 1];

  const caseEntries: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    const en = enBySlug.get(slug);
    const ru = ruBySlug.get(slug);
    if (en) {
      caseEntries.push({
        url: `${SITE_URL}/journal/${slug}`,
        lastModified: en.frontmatter.date,
        priority: 0.6,
        ...(ru ? { alternates: { languages: { ru: `${SITE_URL}/ru/journal/${slug}` } } } : {}),
      });
    }
    if (ru) {
      caseEntries.push({
        url: `${SITE_URL}/ru/journal/${slug}`,
        lastModified: ru.frontmatter.date,
        priority: 0.6,
        ...(en ? { alternates: { languages: { en: `${SITE_URL}/journal/${slug}` } } } : {}),
      });
    }
  }

  const landingEntries: MetadataRoute.Sitemap = LANDING_IDS.flatMap((id) =>
    (['en', 'ru'] as const).map((locale) => ({
      url: landingUrl(id, locale),
      priority: 0.9,
      changeFrequency: 'monthly' as const,
      alternates: {
        languages: { en: landingUrl(id, 'en'), ru: landingUrl(id, 'ru') },
      },
    }))
  );

  return [
    { url: SITE_URL, priority: 1.0, changeFrequency: 'monthly', lastModified: latestDate },
    { url: `${SITE_URL}/ru`, priority: 0.9, changeFrequency: 'monthly', lastModified: latestDate },
    {
      url: `${SITE_URL}/journal`,
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: latestDate,
    },
    {
      url: `${SITE_URL}/ru/journal`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: latestDate,
    },
    ...landingEntries,
    ...caseEntries,
  ];
}
