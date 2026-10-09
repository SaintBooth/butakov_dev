import { describe, expect, it } from 'vitest';
import * as config from '../../src/config/workshop';
import { CHECKIN_CODE_ALPHABET, CHECKIN_CODE_LENGTH, generateCheckinCode } from './lib.mjs';

describe('scripts lib', () => {
  it('shares the check-in alphabet with the app config', () => {
    expect(CHECKIN_CODE_ALPHABET).toBe(config.CHECKIN_CODE_ALPHABET);
    expect(CHECKIN_CODE_LENGTH).toBe(config.CHECKIN_CODE_LENGTH);
  });

  it('generates codes the DB check constraint accepts', () => {
    for (let i = 0; i < 200; i++) expect(generateCheckinCode()).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
  });

  it('uses the injected picker', () => {
    expect(generateCheckinCode(() => 0)).toBe('AAAAAA');
  });
});
