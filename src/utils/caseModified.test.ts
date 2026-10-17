import { describe, expect, it } from 'vitest';
import { latestDate, pickContentEditDate } from './caseModified';

describe('pickContentEditDate', () => {
  it('takes the newest commit', () => {
    expect(pickContentEditDate('2026-10-16 docs(journal): expand\n2026-09-01 fix: typo\n')).toBe(
      '2026-10-16'
    );
  });

  it('skips cosmetic style/chore commits', () => {
    const log =
      '2026-10-20 style(content): em-dash\n2026-10-19 chore: prettier\n2026-10-16 docs: expand\n';
    expect(pickContentEditDate(log)).toBe('2026-10-16');
  });

  it('returns null for empty or cosmetic-only history', () => {
    expect(pickContentEditDate('')).toBeNull();
    expect(pickContentEditDate('2026-09-14 style(content): em-dash\n')).toBeNull();
  });
});

describe('latestDate', () => {
  it('returns the latest defined date', () => {
    expect(latestDate('2025-09-05', null, '2026-10-16', undefined)).toBe('2026-10-16');
    expect(latestDate('2026-10-16', '2025-01-01')).toBe('2026-10-16');
  });
});
