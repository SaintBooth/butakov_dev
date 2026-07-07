import type { MetadataRoute } from 'next';
import { getCaseSlugs } from '@/utils/cases';

const BASE = 'https://butakov.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const cases = getCaseSlugs('en');
  return [
    { url: BASE, priority: 1.0, changeFrequency: 'monthly' },
    { url: `${BASE}/ru`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${BASE}/journal`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE}/ru/journal`, priority: 0.7, changeFrequency: 'weekly' },
    ...cases.map((slug) => ({
      url: `${BASE}/journal/${slug}`,
      priority: 0.6,
      alternates: {
        languages: {
          ru: `${BASE}/ru/journal/${slug}`,
        },
      },
    })),
  ];
}
