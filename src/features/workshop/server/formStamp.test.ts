import { describe, expect, it } from 'vitest';
import { checkStamp, signStamp } from './formStamp';

const secret = 's'.repeat(32);
const MAX_AGE = 60_000;

describe('form stamp', () => {
  it('accepts a stamp older than the minimum fill time', () => {
    expect(checkStamp(signStamp(1000, secret), secret, 5000, 3000, MAX_AGE)).toBe('ok');
  });

  it('flags a form submitted too fast', () => {
    expect(checkStamp(signStamp(1000, secret), secret, 2000, 3000, MAX_AGE)).toBe('too_fast');
  });

  it('rejects a forged or malformed stamp', () => {
    expect(checkStamp(signStamp(1000, 'x'.repeat(32)), secret, 9000, 3000, MAX_AGE)).toBe(
      'invalid'
    );
    expect(checkStamp('garbage', secret, 9000, 3000, MAX_AGE)).toBe('invalid');
    expect(checkStamp('', secret, 9000, 3000, MAX_AGE)).toBe('invalid');
  });

  it('rejects a stamp older than the maximum age, accepts one right at the limit', () => {
    expect(checkStamp(signStamp(1000, secret), secret, 1000 + MAX_AGE, 3000, MAX_AGE)).toBe('ok');
    expect(checkStamp(signStamp(1000, secret), secret, 1001 + MAX_AGE, 3000, MAX_AGE)).toBe(
      'invalid'
    );
  });
});
