import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Content-Security-Policy is set per-request (nonce for App Router's inline
// hydration scripts) in src/middleware.ts, not here — headers() is static
// and can't vary the nonce per response.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // ~16 KB of CSS as two <link>s cost ~700 ms of render-blocking in
    // PageSpeed; inlining puts it in the HTML response itself.
    inlineCss: true,
  },
  async headers() {
    const noIndex = { key: 'X-Robots-Tag', value: 'noindex, nofollow' };
    return [
      { source: '/:path*', headers: securityHeaders },
      // Second layer next to the meta tag: also covers CSV and .ics, where a meta tag cannot exist.
      { source: '/:locale/workshop/:path*', headers: [noIndex] },
      { source: '/api/workshop/:path*', headers: [noIndex] },
      {
        source: '/:locale/workshop/:slug/admin',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          // The URL carries a bearer token; it must not leak through Referer on an outgoing click.
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
