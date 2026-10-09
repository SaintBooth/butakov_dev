import { describe, expect, it } from 'vitest';
import { getClientIp } from './clientIp';

describe('getClientIp', () => {
  it('returns null when no header is configured', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '1.2.3.4' }), undefined)).toBeNull();
  });

  it('takes the first address of a forwarded chain', () => {
    const h = new Headers({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' });
    expect(getClientIp(h, 'x-forwarded-for')).toBe('5.6.7.8');
  });

  it('rejects values that are not IP addresses', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': 'evil' }), 'x-real-ip')).toBeNull();
  });
});
