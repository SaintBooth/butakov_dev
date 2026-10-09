import { describe, expect, it } from 'vitest';
import { tokenFromParam } from './tokenAccess';

describe('tokenFromParam', () => {
  it('passes a single value and drops repeated or missing ones', () => {
    expect(tokenFromParam('abc')).toBe('abc');
    expect(tokenFromParam(['a', 'b'])).toBe('');
    expect(tokenFromParam(undefined)).toBe('');
  });
});
