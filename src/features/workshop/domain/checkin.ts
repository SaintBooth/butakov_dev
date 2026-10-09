import { timingSafeEqual } from 'node:crypto';
import {
  CHECKIN_CLOSES_AFTER_END_MIN,
  CHECKIN_OPENS_BEFORE_END_MIN,
  MINUTE_MS,
} from '@/config/workshop';

export function isCheckinOpen(endsAt: Date, now: Date): boolean {
  const opens = endsAt.getTime() - CHECKIN_OPENS_BEFORE_END_MIN * MINUTE_MS;
  const closes = endsAt.getTime() + CHECKIN_CLOSES_AFTER_END_MIN * MINUTE_MS;
  return now.getTime() >= opens && now.getTime() <= closes;
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase();
}

export function codesMatch(input: string, expected: string): boolean {
  const a = Buffer.from(normalizeCode(input));
  const b = Buffer.from(expected);
  // timingSafeEqual throws on unequal lengths; the code length is public anyway.
  return a.length === b.length && timingSafeEqual(a, b);
}
