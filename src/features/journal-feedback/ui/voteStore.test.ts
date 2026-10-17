import { describe, expect, it } from 'vitest';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import { isVoterId } from '../domain/voterId';
import { getVoterId, readVote, writeVote } from './voteStore';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, v),
  };
}

describe('readVote / writeVote', () => {
  it('round-trips per slug', () => {
    const s = memoryStorage();
    writeVote(s, 'a', 'yes');
    writeVote(s, 'b', 'no');
    expect([readVote(s, 'a'), readVote(s, 'b'), readVote(s, 'c')]).toEqual(['yes', 'no', null]);
  });

  it('survives missing storage and corrupt data', () => {
    expect(readVote(null, 'a')).toBeNull();
    expect(() => writeVote(null, 'a', 'yes')).not.toThrow();
    const s = memoryStorage();
    s.setItem(JOURNAL_FEEDBACK.storageKey, '{not json');
    expect(readVote(s, 'a')).toBeNull();
    s.setItem(JOURNAL_FEEDBACK.storageKey, JSON.stringify({ a: 'maybe' }));
    expect(readVote(s, 'a')).toBeNull();
  });

  it('survives a storage that throws on write', () => {
    const s = memoryStorage();
    s.setItem = () => {
      throw new Error('quota');
    };
    expect(() => writeVote(s, 'a', 'yes')).not.toThrow();
  });
});

describe('getVoterId', () => {
  it('creates a uuid once and reuses it', () => {
    const s = memoryStorage();
    const id = getVoterId(s);
    expect(isVoterId(id)).toBe(true);
    expect(getVoterId(s)).toBe(id);
  });

  it('replaces a tampered id', () => {
    const s = memoryStorage();
    s.setItem(JOURNAL_FEEDBACK.voterIdKey, 'not-a-uuid');
    expect(isVoterId(getVoterId(s))).toBe(true);
  });

  it('keeps one id for the session when storage is unavailable', () => {
    expect(getVoterId(null)).toBe(getVoterId(null));
  });
});
