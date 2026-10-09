import { createHmac, timingSafeEqual } from 'node:crypto';

export type StampCheck = 'ok' | 'too_fast' | 'invalid';

function mac(renderedAtMs: number, secret: string): string {
  return createHmac('sha256', secret).update(String(renderedAtMs)).digest('base64url');
}

export function signStamp(renderedAtMs: number, secret: string): string {
  return `${renderedAtMs}.${mac(renderedAtMs, secret)}`;
}

export function checkStamp(
  stamp: string,
  secret: string,
  nowMs: number,
  minFillMs: number,
  maxAgeMs: number
): StampCheck {
  const [ts, given] = stamp.split('.');
  const renderedAt = Number(ts);
  if (!given || !Number.isSafeInteger(renderedAt)) return 'invalid';
  const a = Buffer.from(given);
  const b = Buffer.from(mac(renderedAt, secret));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalid';
  const age = nowMs - renderedAt;
  if (age > maxAgeMs) return 'invalid';
  return age < minFillMs ? 'too_fast' : 'ok';
}
