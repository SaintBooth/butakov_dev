import { describe, expect, it } from 'vitest';
import { decode, encode, type Action } from './callbacks';

const samples: Action[] = [
  { a: 'menu' },
  { a: 'past' },
  { a: 'new' },
  { a: 'cancel' },
  { a: 'confirm' },
  { a: 'fix' },
  { a: 'card', id: 12 },
  { a: 'people', id: 12, page: 3 },
  { a: 'link', id: 7 },
  { a: 'edit', id: 7 },
  { a: 'field', id: 7, field: 'materials' },
  { a: 'toggle', id: 7 },
  { a: 'summary', id: 2147483647 },
  { a: 'pick', value: 90 },
];

describe('callbacks', () => {
  it.each(samples)('round-trips %o within 64 bytes', (action) => {
    const data = encode(action);
    expect(Buffer.byteLength(data)).toBeLessThanOrEqual(64);
    expect(decode(data)).toEqual(action);
  });
  it.each(['', 'zzz', 'c:', 'c:abc', 'f:7:password', 'u:1', 'c:-1', 'c:1:2'])('rejects %s', (d) => {
    expect(decode(d)).toBeNull();
  });
});
