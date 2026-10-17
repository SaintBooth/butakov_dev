import { describe, expect, it } from 'vitest';
import { rateLimitKey } from './rateLimitKey';

describe('rateLimitKey', () => {
  it('groups IPv4 by /24', () => {
    expect(rateLimitKey('203.0.113.7')).toBe(rateLimitKey('203.0.113.250'));
    expect(rateLimitKey('203.0.113.7')).not.toBe(rateLimitKey('203.0.114.7'));
  });

  it('groups IPv6 by /64, including compressed forms', () => {
    expect(rateLimitKey('2001:db8:1:2::1')).toBe(rateLimitKey('2001:db8:1:2:ffff:0:0:9'));
    expect(rateLimitKey('2001:db8:1:2::1')).toBe(rateLimitKey('2001:0DB8:0001:0002::5'));
    expect(rateLimitKey('2001:db8:1:2::1')).not.toBe(rateLimitKey('2001:db8:1:3::1'));
  });

  it('treats IPv4-mapped IPv6 as IPv4', () => {
    expect(rateLimitKey('::ffff:203.0.113.7')).toBe(rateLimitKey('203.0.113.9'));
  });

  it('returns null without an address', () => {
    expect(rateLimitKey(null)).toBeNull();
  });
});
