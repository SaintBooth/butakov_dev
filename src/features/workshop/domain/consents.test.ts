import { describe, expect, it } from 'vitest';
import { consentTextHash, currentConsents } from './consents';

const at = (m: number) => new Date(Date.UTC(2026, 9, 20, 12, m));

describe('currentConsents', () => {
  it('defaults every kind to false', () => {
    expect(currentConsents([])).toEqual({
      pd_processing: false,
      marketing: false,
      portfolio: false,
      quote: false,
    });
  });

  it('lets a later revocation override an earlier grant', () => {
    const state = currentConsents([
      { kind: 'portfolio', granted: true, createdAt: at(0) },
      { kind: 'marketing', granted: true, createdAt: at(0) },
      { kind: 'portfolio', granted: false, createdAt: at(5) },
    ]);
    expect(state.portfolio).toBe(false);
    expect(state.marketing).toBe(true);
  });

  it('lets the later array entry win on equal timestamps', () => {
    const state = currentConsents([
      { kind: 'quote', granted: true, createdAt: at(1) },
      { kind: 'quote', granted: false, createdAt: at(1) },
    ]);
    expect(state.quote).toBe(false);
  });
});

describe('consentTextHash', () => {
  it('is a stable sha256 hex digest of the utf-8 text', () => {
    expect(consentTextHash('согласие')).toBe(consentTextHash('согласие'));
    expect(consentTextHash('согласие')).toMatch(/^[0-9a-f]{64}$/);
    expect(consentTextHash('a')).not.toBe(consentTextHash('b'));
  });
});
