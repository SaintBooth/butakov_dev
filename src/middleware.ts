import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { buildCsp } from '@/config/csp';
import { wwwRedirectTarget } from '@/utils/canonicalHost';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // next-intl builds the Link header from the request path and knows nothing
  // about localized landing slugs: /ru/razrabotka-saytov advertised a 404
  // /razrabotka-saytov as its EN twin. Pages emit correct hreflang in <head>.
  alternateLinks: false,
});

export default function middleware(request: NextRequest) {
  const redirectTo = wwwRedirectTarget(
    request.headers.get('host'),
    request.headers.get('x-forwarded-host'),
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  if (redirectTo) return NextResponse.redirect(redirectTo, 301);

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
