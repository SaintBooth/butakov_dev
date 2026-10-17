import { z } from 'zod';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import { isVoterId } from '../domain/voterId';
import type { Choice } from './feedbackReducer';

const votesSchema = z.record(z.string(), z.enum(['yes', 'no']));

// Private mode and blocked site data throw on access; the widget must still work without storage.
export function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readAll(storage: Storage | null): Record<string, Choice> {
  try {
    const raw = storage?.getItem(JOURNAL_FEEDBACK.storageKey);
    const parsed = votesSchema.safeParse(raw ? JSON.parse(raw) : {});
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function write(storage: Storage | null, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // A lost local mark only means the question shows again on the next visit.
  }
}

export function readVote(storage: Storage | null, slug: string): Choice | null {
  return readAll(storage)[slug] ?? null;
}

export function writeVote(storage: Storage | null, slug: string, choice: Choice): void {
  write(
    storage,
    JOURNAL_FEEDBACK.storageKey,
    JSON.stringify({ ...readAll(storage), [slug]: choice })
  );
}

let sessionVoterId: string | null = null;

// A random id kept by the browser, not a cookie: setting a cookie from a server action would
// re-render the statically generated article. The server only ever stores its keyed hash.
export function getVoterId(storage: Storage | null): string {
  let stored: string | null = null;
  try {
    stored = storage?.getItem(JOURNAL_FEEDBACK.voterIdKey) ?? null;
  } catch {
    stored = null;
  }
  if (stored && isVoterId(stored)) return stored;
  const id = sessionVoterId ?? crypto.randomUUID();
  sessionVoterId = id;
  write(storage, JOURNAL_FEEDBACK.voterIdKey, id);
  return id;
}
