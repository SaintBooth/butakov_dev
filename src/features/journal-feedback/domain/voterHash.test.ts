import { describe, expect, it } from 'vitest';
import { voterHash } from './voterHash';
import { isVoterId } from './voterId';

const SECRET = 's'.repeat(32);
const ID = '0b6f3c1e-8f3a-4c2b-9a51-2d7e4f1c9a10';

describe('voterHash', () => {
  it('is deterministic hex', () => {
    expect(voterHash(SECRET, ID)).toBe(voterHash(SECRET, ID));
    expect(voterHash(SECRET, ID)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs per voter and per secret', () => {
    expect(voterHash(SECRET, ID)).not.toBe(voterHash(SECRET, ID.replace('0b', '1b')));
    expect(voterHash(SECRET, ID)).not.toBe(voterHash('t'.repeat(32), ID));
  });
});

describe('isVoterId', () => {
  it('accepts a v4 uuid only', () => {
    expect(isVoterId(ID)).toBe(true);
    expect(isVoterId('not-a-uuid')).toBe(false);
    expect(isVoterId('0b6f3c1e-8f3a-1c2b-9a51-2d7e4f1c9a10')).toBe(false);
  });
});
