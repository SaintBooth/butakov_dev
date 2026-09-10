import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/ru/card', '/en/card', '/card'] },
    sitemap: 'https://butakov.dev/sitemap.xml',
  };
}
