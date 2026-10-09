import { describe, expect, it } from 'vitest';
import { buildCsp } from './csp';

describe('buildCsp', () => {
  it('allows eval only in development', () => {
    expect(buildCsp('n', { development: true })).toContain("'unsafe-eval'");
    expect(buildCsp('n', { development: false })).not.toContain('unsafe-eval');
  });

  it('keeps the nonce and strict-dynamic in both modes', () => {
    for (const development of [true, false]) {
      expect(buildCsp('abc', { development })).toContain("'nonce-abc' 'strict-dynamic'");
    }
  });
});
