import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows max hits per window per key, then frees up', () => {
    const { allow } = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(allow('a', 0)).toBe(true);
    expect(allow('a', 10)).toBe(true);
    expect(allow('a', 20)).toBe(false);
    expect(allow('b', 20)).toBe(true);
    expect(allow('a', 1001)).toBe(true);
  });

  it('isLimited reads the budget without spending it', () => {
    const { isLimited, hit } = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(isLimited('a', 0)).toBe(false);
    expect(isLimited('a', 0)).toBe(false);
    hit('a', 0);
    hit('a', 1);
    expect(isLimited('a', 2)).toBe(true);
    expect(isLimited('a', 1002)).toBe(false);
  });

  it('drops only expired keys when full, so throttled clients stay throttled', () => {
    const { hit, isLimited } = createRateLimiter({ max: 1, windowMs: 1000 }, 3);
    hit('old', 0);
    hit('b', 900);
    hit('c', 900);
    hit('d', 1001);
    expect(isLimited('b', 1002)).toBe(true);
    expect(isLimited('c', 1002)).toBe(true);
    expect(isLimited('d', 1002)).toBe(true);
  });

  it('forgets the least recently hit key when nothing has expired', () => {
    const { hit, isLimited } = createRateLimiter({ max: 1, windowMs: 1000 }, 2);
    hit('a', 0);
    hit('b', 1);
    hit('c', 2);
    expect(isLimited('a', 3)).toBe(false);
    expect(isLimited('b', 3)).toBe(true);
    expect(isLimited('c', 3)).toBe(true);
  });
});
