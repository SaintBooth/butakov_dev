import { UMAMI } from './analytics';

export function buildCsp(nonce: string, { development }: { development: boolean }): string {
  // React's dev build uses eval for stack reconstruction; without it the page never hydrates.
  // Production keeps the strict policy.
  const devEval = development ? " 'unsafe-eval'" : '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval} https://mc.yandex.ru https://mc.yandex.com https://yastatic.net ${UMAMI.origin}`,
    `connect-src 'self' https://mc.yandex.ru https://mc.yandex.com wss://mc.yandex.com https://yastatic.net https://api.web3forms.com ${UMAMI.origin}`,
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
