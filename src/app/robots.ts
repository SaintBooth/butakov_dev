import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/landings';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/ru/card', '/card'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
