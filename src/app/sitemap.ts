import type { MetadataRoute } from 'next';
import { getAllCaseFrontmatters } from '@/utils/cases';

const BASE = 'https://butakov.dev';

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
        url: `${BASE}/journal/${slug}`,
        lastModified: en.frontmatter.date,
        priority: 0.6,
        ...(ru ? { alternates: { languages: { ru: `${BASE}/ru/journal/${slug}` } } } : {}),
      });
    }
    if (ru) {
      caseEntries.push({
        url: `${BASE}/ru/journal/${slug}`,
        lastModified: ru.frontmatter.date,
        priority: 0.6,
        ...(en ? { alternates: { languages: { en: `${BASE}/journal/${slug}` } } } : {}),
      });
    }
  }

  return [
    { url: BASE, priority: 1.0, changeFrequency: 'monthly', lastModified: latestDate },
    { url: `${BASE}/ru`, priority: 0.9, changeFrequency: 'monthly', lastModified: latestDate },
    { url: `${BASE}/journal`, priority: 0.8, changeFrequency: 'weekly', lastModified: latestDate },
    {
      url: `${BASE}/ru/journal`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: latestDate,
    },
    ...caseEntries,
  ];
}
