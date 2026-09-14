import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://mc.yandex.ru https://mc.yandex.com https://yastatic.net`,
    "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com wss://mc.yandex.com https://yastatic.net https://api.web3forms.com",
    "img-src 'self' data: https://mc.yandex.ru https://mc.yandex.com",
    'frame-src https://mc.yandex.com',
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "form-action 'self' https://api.web3forms.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}

export default function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const response = intlMiddleware(request);
  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
