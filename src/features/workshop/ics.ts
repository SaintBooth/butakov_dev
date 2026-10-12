import { ICS_PRODID } from '@/config/workshop';

export interface IcsEvent {
  uid: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  now: Date;
  description?: string;
  url?: string;
  sequence?: number;
}

const MAX_LINE_OCTETS = 75;

function utc(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

// URI values are not TEXT: RFC 5545 forbids escaping them, so only the line breaks that would
// inject extra properties are removed.
function stripLineBreaks(s: string): string {
  return s.replace(/[\r\n]+/g, '');
}

// RFC 5545 §3.1: fold at 75 octets; a continuation line starts with a space.
function fold(line: string): string {
  const parts: string[] = [];
  let current = '';
  let octets = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch);
    if (octets + size > MAX_LINE_OCTETS) {
      parts.push(current);
      current = ` ${ch}`;
      octets = 1 + size;
    } else {
      current += ch;
      octets += size;
    }
  }
  parts.push(current);
  return parts.join('\r\n');
}

export function buildIcs(e: IcsEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${ICS_PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(e.uid)}`,
    `DTSTAMP:${utc(e.now)}`,
    `DTSTART:${utc(e.startsAt)}`,
    `DTEND:${utc(e.endsAt)}`,
    `SUMMARY:${escapeText(e.title)}`,
  ];
  if (e.sequence !== undefined) lines.push(`SEQUENCE:${e.sequence}`);
  if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
  if (e.url) lines.push(`URL:${stripLineBreaks(e.url)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
