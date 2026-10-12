import { describe, expect, it } from 'vitest';
import {
  parseCapacity,
  parseDuration,
  parseHttpsUrl,
  parseStart,
  parseTitle,
  slugBase,
} from './parse';

const now = new Date('2026-10-12T09:00:00Z'); // 12:00 МСК

describe('parseStart', () => {
  it('reads dd.mm hh:mm as Moscow time in the current year', () => {
    expect(parseStart('31.10 19:00', now)).toEqual({
      ok: true,
      value: new Date('2026-10-31T16:00:00Z'),
    });
  });
  it('rolls a past day-month over to next year', () => {
    expect(parseStart('05.01 10:30', now)).toEqual({
      ok: true,
      value: new Date('2027-01-05T07:30:00Z'),
    });
  });
  it('accepts an explicit year and single digits', () => {
    expect(parseStart('1.11.2026 9:05', now)).toEqual({
      ok: true,
      value: new Date('2026-11-01T06:05:00Z'),
    });
  });
  it('rejects an explicit date in the past', () => {
    expect(parseStart('01.10.2026 10:00', now)).toEqual({ ok: false, error: 'past' });
  });
  it('rejects impossible dates and garbage', () => {
    expect(parseStart('31.02 10:00', now)).toEqual({ ok: false, error: 'datetime' });
    expect(parseStart('12.10 25:00', now)).toEqual({ ok: false, error: 'datetime' });
    expect(parseStart('завтра', now)).toEqual({ ok: false, error: 'datetime' });
  });
});

describe('parseDuration', () => {
  it.each([
    ['90', 90],
    ['1:30', 90],
    ['2ч', 120],
    ['1,5ч', 90],
    ['1.5', 90],
  ])('%s → %i', (s, m) => {
    expect(parseDuration(s)).toEqual({ ok: true, value: m });
  });
  it.each(['0', '-5', '1:75', 'долго', '601'])('rejects %s', (s) => {
    expect(parseDuration(s)).toEqual({ ok: false, error: 'duration' });
  });
});

describe('parseHttpsUrl', () => {
  it('accepts https and trims', () => {
    expect(parseHttpsUrl(' https://telemost.yandex.ru/j/1 ')).toEqual({
      ok: true,
      value: 'https://telemost.yandex.ru/j/1',
    });
  });
  it.each(['http://x.ru', 'javascript:alert(1)', 'telemost', ''])('rejects %s', (s) => {
    expect(parseHttpsUrl(s)).toEqual({ ok: false, error: 'url' });
  });
});

describe('parseCapacity', () => {
  it('accepts a positive integer', () =>
    expect(parseCapacity('30')).toEqual({ ok: true, value: 30 }));
  it('respects the minimum', () =>
    expect(parseCapacity('5', 12)).toEqual({ ok: false, error: 'capacity' }));
  it.each(['0', '2.5', 'abc', '10001'])('rejects %s', (s) =>
    expect(parseCapacity(s).ok).toBe(false)
  );
});

describe('parseTitle', () => {
  it('trims', () =>
    expect(parseTitle('  ИИ в бизнесе ')).toEqual({ ok: true, value: 'ИИ в бизнесе' }));
  it('rejects empty and too long', () => {
    expect(parseTitle('   ').ok).toBe(false);
    expect(parseTitle('x'.repeat(121)).ok).toBe(false);
  });
});

describe('slugBase', () => {
  it('uses the Moscow calendar date', () => {
    // 22:30 UTC on the 31st is already 1 November in Moscow.
    expect(slugBase(new Date('2026-10-31T22:30:00Z'))).toBe('ai-2026-11-01');
  });
});
