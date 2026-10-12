import { BOT, WORKSHOP_TIME_ZONE, WORKSHOP_UTC_OFFSET } from '@/config/workshop';

export type ParseError = 'title' | 'datetime' | 'past' | 'duration' | 'url' | 'capacity';
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: ParseError };

const ok = <T>(value: T): Parsed<T> => ({ ok: true, value });
const fail = <T>(error: ParseError): Parsed<T> => ({ ok: false, error });
const pad = (n: number) => String(n).padStart(2, '0');

// Below this a bare number is hours ("2", "1.5"), above it minutes ("90").
const HOURS_THRESHOLD = 12;

export function parseTitle(s: string): Parsed<string> {
  const v = s.trim();
  return v.length > 0 && v.length <= BOT.titleMaxLength ? ok(v) : fail('title');
}

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: WORKSHOP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function moscowParts(d: Date) {
  const parts = partsFormatter.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

function moscowInstant(y: number, mo: number, d: number, h: number, mi: number): Date | null {
  const at = new Date(`${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00${WORKSHOP_UTC_OFFSET}`);
  if (Number.isNaN(at.getTime())) return null;
  // Date rolls 31.02 over to 03.03; reading the parts back catches that.
  const p = moscowParts(at);
  return p.year === y && p.month === mo && p.day === d ? at : null;
}

const START = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?\s+(\d{1,2}):(\d{2})$/;

export function parseStart(s: string, now: Date): Parsed<Date> {
  const m = START.exec(s.trim());
  if (!m) return fail('datetime');
  const [d, mo, h, mi] = [m[1], m[2], m[4], m[5]].map(Number);
  if (h > 23 || mi > 59) return fail('datetime');
  if (m[3]) {
    const at = moscowInstant(Number(m[3]), mo, d, h, mi);
    if (!at) return fail('datetime');
    return at > now ? ok(at) : fail('past');
  }
  const year = moscowParts(now).year;
  const at = moscowInstant(year, mo, d, h, mi);
  if (!at) return fail('datetime');
  if (at > now) return ok(at);
  const next = moscowInstant(year + 1, mo, d, h, mi);
  return next ? ok(next) : fail('datetime');
}

export function parseDuration(s: string): Parsed<number> {
  const v = s.trim().toLowerCase().replace(/\s*ч$/, '').replace(',', '.');
  let minutes: number;
  const hm = /^(\d{1,2}):(\d{2})$/.exec(v);
  if (hm) {
    if (Number(hm[2]) > 59) return fail('duration');
    minutes = Number(hm[1]) * 60 + Number(hm[2]);
  } else if (/^\d+(\.\d+)?$/.test(v)) {
    const n = Number(v);
    minutes = n <= HOURS_THRESHOLD ? Math.round(n * 60) : n;
  } else {
    return fail('duration');
  }
  return Number.isInteger(minutes) && minutes > 0 && minutes <= BOT.maxDurationMin
    ? ok(minutes)
    : fail('duration');
}

export function parseHttpsUrl(s: string): Parsed<string> {
  const v = s.trim();
  try {
    return new URL(v).protocol === 'https:' ? ok(v) : fail('url');
  } catch {
    return fail('url');
  }
}

export function parseCapacity(s: string, min = 1): Parsed<number> {
  const v = s.trim();
  if (!/^[1-9]\d*$/.test(v)) return fail('capacity');
  const n = Number(v);
  return n >= min && n <= BOT.maxCapacity ? ok(n) : fail('capacity');
}

export function slugBase(startsAt: Date): string {
  const p = moscowParts(startsAt);
  return `${BOT.slugPrefix}-${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
