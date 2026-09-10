import { describe, it, expect } from 'vitest';
import { buildVCard, VCARD_FILENAME } from './vcard';
import type { Contact } from '@/config/contact';

const c: Contact = {
  name: 'Александр Бутаков',
  role: 'Технический партнёр для бизнеса',
  phoneE164: '+79126315779',
  phoneDisplay: '+7 912 63 15 779',
  email: 'hello@butakov.dev',
  url: 'https://butakov.dev',
  telegramHandle: 'SashaBooth',
  telegramUrl: 'https://t.me/SashaBooth',
};
const now = new Date('2026-09-10T08:00:00Z');

describe('buildVCard', () => {
  const out = buildVCard(c, now);
  const lines = out.split('\r\n');

  it('uses CRLF line endings only', () => {
    expect(out).toContain('\r\n');
    expect(out.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('starts and ends with the vCard envelope', () => {
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[1]).toBe('VERSION:3.0');
    expect(lines[lines.length - 1]).toBe('END:VCARD');
  });

  it('emits N and FN with the Cyrillic name, no CHARSET param', () => {
    expect(lines).toContain('N:Бутаков;Александр;;;');
    expect(lines).toContain('FN:Александр Бутаков');
    expect(out).not.toContain('CHARSET');
  });

  it('emits ORG, TITLE, TEL (E.164), EMAIL, URL', () => {
    expect(lines).toContain('ORG:butakov.dev');
    expect(lines).toContain('TITLE:Технический партнёр для бизнеса');
    expect(lines).toContain('TEL;TYPE=CELL,VOICE:+79126315779');
    expect(lines).toContain('EMAIL;TYPE=INTERNET:hello@butakov.dev');
    expect(lines).toContain('URL:https://butakov.dev');
  });

  it('emits the Apple-grouped Telegram label and X-SOCIALPROFILE', () => {
    expect(lines).toContain('item1.URL:https://t.me/SashaBooth');
    expect(lines).toContain('item1.X-ABLabel:Telegram');
    expect(lines).toContain('X-SOCIALPROFILE;TYPE=telegram:https://t.me/SashaBooth');
  });

  it('emits REV in UTC basic ISO form', () => {
    expect(lines).toContain('REV:2026-09-10T08:00:00Z');
  });

  it('escapes special characters in text values', () => {
    const tricky = buildVCard({ ...c, role: 'A; B, C\\D' }, now);
    expect(tricky).toContain('TITLE:A\\; B\\, C\\\\D');
  });

  it('exposes an ASCII filename', () => {
    expect(VCARD_FILENAME).toBe('aleksandr-butakov.vcf');
    expect(/^[\x20-\x7e]+$/.test(VCARD_FILENAME)).toBe(true);
  });
});
