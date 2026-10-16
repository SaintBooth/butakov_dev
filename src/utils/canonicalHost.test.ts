import { describe, expect, it } from 'vitest';
import { wwwRedirectTarget } from './canonicalHost';

describe('wwwRedirectTarget', () => {
  it('redirects www host to the apex keeping path and query', () => {
    expect(wwwRedirectTarget('www.butakov.dev', null, '/ru/journal?a=1')).toBe(
      'https://butakov.dev/ru/journal?a=1'
    );
  });

  it('prefers x-forwarded-host over host', () => {
    expect(wwwRedirectTarget('127.0.0.1:3000', 'www.butakov.dev', '/')).toBe(
      'https://butakov.dev/'
    );
  });

  it('is case-insensitive and takes the first forwarded value', () => {
    expect(wwwRedirectTarget(null, 'WWW.Butakov.dev, proxy', '/')).toBe('https://butakov.dev/');
  });

  it('leaves the canonical host and unrelated hosts alone', () => {
    expect(wwwRedirectTarget('butakov.dev', null, '/')).toBeNull();
    expect(wwwRedirectTarget('localhost:3000', null, '/')).toBeNull();
    expect(wwwRedirectTarget(null, null, '/')).toBeNull();
  });
});
