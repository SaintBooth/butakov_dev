import { describe, expect, it } from 'vitest';
import { POSITION_TITLES } from '@/data/positionTitles';
import { normalizePosition, translatePosition } from './positionTitle';

const POSITION_LATIN = /^[A-Za-z0-9 .,'&()/+#-]+$/;

describe('translatePosition', () => {
  it.each([
    ['Генеральный директор', 'CEO'],
    ['  руководитель   отдела продаж ', 'Head of Sales'],
    ['Руководитель отдела продаж.', 'Head of Sales'],
    ['Фронтенд - разработчик', 'Frontend Developer'],
    ['Управляющий партнёр', 'Managing Partner'],
    ['Программист 1С', '1C Developer'],
    ['UX/UI дизайнер', 'UX/UI Designer'],
    ['Разработчик ПО', 'Software Developer'],
  ])('%s → %s', (ru, en) => {
    expect(translatePosition(ru)).toBe(en);
  });

  it('does not guess titles it does not know', () => {
    expect(translatePosition('Руководитель отдела качества')).toBeNull();
    expect(translatePosition('')).toBeNull();
  });

  it('keeps the dictionary unambiguous and valid for the english field', () => {
    const seen = new Map<string, string>();
    for (const [english, variants] of POSITION_TITLES) {
      expect(english).toMatch(POSITION_LATIN);
      for (const v of variants) {
        const key = normalizePosition(v);
        expect(seen.get(key), `"${v}" is listed twice`).toBeUndefined();
        seen.set(key, english);
      }
    }
  });
});
