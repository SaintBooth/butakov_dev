import { describe, expect, it } from 'vitest';
import { formatSessionDate } from './format';

describe('formatSessionDate', () => {
  it('renders Moscow time with the zone label', () => {
    const s = formatSessionDate(new Date('2026-10-20T12:00:00Z'), 'МСК');
    expect(s).toContain('20 октября 2026');
    expect(s).toContain('15:00');
    expect(s.endsWith('(МСК)')).toBe(true);
  });
});
