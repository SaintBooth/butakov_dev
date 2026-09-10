import type { Contact } from '@/config/contact';

export const VCARD_FILENAME = 'aleksandr-butakov.vcf';

/** Экранирование по vCard 3.0: backslash, запятая, точка с запятой, перевод строки. */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** REV в формате YYYY-MM-DDTHH:mm:ssZ (UTC, без миллисекунд). */
function rev(now: Date): string {
  return now.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Фамилия/имя из "Имя Фамилия". */
function splitName(full: string): { family: string; given: string } {
  const parts = full.trim().split(/\s+/);
  const given = parts.shift() ?? '';
  return { family: parts.join(' '), given };
}

export function buildVCard(contact: Contact, now: Date = new Date()): string {
  const { family, given } = splitName(contact.name);
  const org = contact.url.replace(/^https?:\/\//, '');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(contact.name)}`,
    `ORG:${esc(org)}`,
    `TITLE:${esc(contact.role)}`,
    `TEL;TYPE=CELL,VOICE:${contact.phoneE164}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    `URL:${contact.url}`,
    `item1.URL:${contact.telegramUrl}`,
    'item1.X-ABLabel:Telegram',
    `X-SOCIALPROFILE;TYPE=telegram:${contact.telegramUrl}`,
    `REV:${rev(now)}`,
    'END:VCARD',
  ];

  return lines.join('\r\n');
}
