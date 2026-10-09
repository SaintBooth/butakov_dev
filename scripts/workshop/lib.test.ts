import { describe, expect, it } from 'vitest';
import * as config from '../../src/config/workshop';
import {
  CHECKIN_CODE_ALPHABET,
  CHECKIN_CODE_LENGTH,
  generateCheckinCode,
  parseCreateSessionArgs,
  readSiteUrl,
} from './lib.mjs';

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

describe('parseCreateSessionArgs', () => {
  const base = [
    '--slug',
    'ai-2026-10',
    '--title',
    'ИИ',
    '--starts',
    '2026-10-20T15:00:00+03:00',
    '--ends',
    '2026-10-20T17:00:00+03:00',
    '--meeting',
    'https://telemost.yandex.ru/j/1',
  ];

  it('parses the required options and leaves capacity to the column default', () => {
    const session = parseCreateSessionArgs(base);
    expect(session.startsAt.toISOString()).toBe('2026-10-20T12:00:00.000Z');
    expect(session.endsAt.toISOString()).toBe('2026-10-20T14:00:00.000Z');
    expect(session.meetingUrl).toBe('https://telemost.yandex.ru/j/1');
    expect(session).not.toHaveProperty('capacity');
  });

  it('passes an explicit capacity through as a number', () => {
    expect(parseCreateSessionArgs([...base, '--capacity', '45']).capacity).toBe(45);
  });

  it.each(['0', '-3', '1.5', 'abc', ''])('rejects capacity %j', (capacity) => {
    expect(() => parseCreateSessionArgs([...base, '--capacity', capacity])).toThrow(/capacity/);
  });

  it('prints the usage when a required option is missing', () => {
    expect(() => parseCreateSessionArgs(base.slice(2))).toThrow(/usage:/);
  });

  it.each([
    ['not a date', 'tomorrow'],
    ['no offset', '2026-10-20T15:00:00'],
    ['impossible day', '2026-13-40T15:00:00+03:00'],
  ])('rejects a start with %s', (_label, starts) => {
    const args = base.map((a) => (a === '2026-10-20T15:00:00+03:00' ? starts : a));
    expect(() => parseCreateSessionArgs(args)).toThrow(/--starts/);
  });

  it('rejects an end that is not after the start', () => {
    const args = base.map((a) =>
      a === '2026-10-20T17:00:00+03:00' ? '2026-10-20T15:00:00+03:00' : a
    );
    expect(() => parseCreateSessionArgs(args)).toThrow(/later than --starts/);
  });
});

describe('readSiteUrl', () => {
  it('fails clearly when SITE_URL is missing', () => {
    expect(() => readSiteUrl({})).toThrow(/SITE_URL is not set/);
  });

  it('drops trailing slashes', () => {
    expect(readSiteUrl({ SITE_URL: 'https://example.test//' })).toBe('https://example.test');
  });
});
