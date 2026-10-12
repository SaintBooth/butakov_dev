import { describe, expect, it, beforeEach } from 'vitest';
import { RATE_LIMITS } from '@/config/workshop';
import { viewLinkFailures, resetViewLinkFailures } from './viewLinkGate';

beforeEach(() => {
  resetViewLinkFailures();
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

    // Hit max-1 times and verify not limited
    for (let i = 0; i < max - 1; i++) {
      expect(limiter.isLimited(ip)).toBe(false);
      limiter.hit(ip);
    }

    // Hit once more to reach the limit
    expect(limiter.isLimited(ip)).toBe(false);
    limiter.hit(ip);

    // Now it should be limited
    expect(limiter.isLimited(ip)).toBe(true);
  });
});
