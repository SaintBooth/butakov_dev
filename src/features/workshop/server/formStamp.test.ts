import { describe, expect, it } from 'vitest';
import { checkStamp, signStamp } from './formStamp';

const secret = 's'.repeat(32);

describe('form stamp', () => {
  it('accepts a stamp older than the minimum fill time', () => {
    expect(checkStamp(signStamp(1000, secret), secret, 5000, 3000)).toBe('ok');
  });

  it('flags a form submitted too fast', () => {
    expect(checkStamp(signStamp(1000, secret), secret, 2000, 3000)).toBe('too_fast');
  });

  it('rejects a forged or malformed stamp', () => {
    expect(checkStamp(signStamp(1000, 'x'.repeat(32)), secret, 9000, 3000)).toBe('invalid');
    expect(checkStamp('garbage', secret, 9000, 3000)).toBe('invalid');
    expect(checkStamp('', secret, 9000, 3000)).toBe('invalid');
  });
});
