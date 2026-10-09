import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { buildCsp } from '@/config/csp';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const response = intlMiddleware(request);
  response.headers.set(
    'Content-Security-Policy',
    buildCsp(nonce, { development: process.env.NODE_ENV === 'development' })
  );
  return response;
}

export const config = {
  // `api/` with the slash: a bare `api` prefix would also skip pages like /apis-guide.
  matcher: ['/((?!api/|_next|.*\\..*).*)'],
};
