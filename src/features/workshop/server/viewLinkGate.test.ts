import { describe, expect, it, beforeEach } from 'vitest';
import { RATE_LIMITS } from '@/config/workshop';
import { viewLinkFailures } from './viewLinkGate';

// Reset globalThis before each test
beforeEach(() => {
  delete (globalThis as any).__workshopViewLinkFailures;
});

describe('viewLinkGate', () => {
  it('returns the same instance on repeated calls', () => {
    const first = viewLinkFailures();
    const second = viewLinkFailures();
    expect(first).toBe(second);
  });

  it('limits after RATE_LIMITS.export.max hits for one ip', () => {
    const limiter = viewLinkFailures();
    const ip = '192.168.1.1';
    const max = RATE_LIMITS.export.max;

    // Hit the limit exactly
    for (let i = 0; i < max; i++) {
      expect(limiter.isLimited(ip)).toBe(i >= max);
      if (!limiter.isLimited(ip)) {
        limiter.hit(ip);
      }
    }

    // One more hit should exceed the limit
    expect(limiter.isLimited(ip)).toBe(true);
  });
});
