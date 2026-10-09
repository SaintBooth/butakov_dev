import { describe, expect, it } from 'vitest';
import { codesMatch, isCheckinOpen, normalizeCode } from './checkin';

const endsAt = new Date('2026-10-20T15:00:00Z');
const at = (iso: string) => new Date(iso);

describe('isCheckinOpen', () => {
  it('opens exactly 15 minutes before the end', () => {
    expect(isCheckinOpen(endsAt, at('2026-10-20T14:45:00Z'))).toBe(true);
    expect(isCheckinOpen(endsAt, at('2026-10-20T14:44:59Z'))).toBe(false);
  });

  it('closes exactly 30 minutes after the end', () => {
    expect(isCheckinOpen(endsAt, at('2026-10-20T15:30:00Z'))).toBe(true);
    expect(isCheckinOpen(endsAt, at('2026-10-20T15:30:01Z'))).toBe(false);
  });
});

describe('codesMatch', () => {
  it('ignores case and surrounding spaces', () => {
    expect(normalizeCode('  ab3k9z ')).toBe('AB3K9Z');
    expect(codesMatch(' ab3k9z', 'AB3K9Z')).toBe(true);
  });

  it('rejects a different or shorter code without throwing', () => {
    expect(codesMatch('AB3K9Y', 'AB3K9Z')).toBe(false);
    expect(codesMatch('AB3', 'AB3K9Z')).toBe(false);
  });
});
