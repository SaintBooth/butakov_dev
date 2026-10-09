import { MAX_TRACKED_KEYS } from '@/config/workshop';

interface Limit {
  max: number;
  windowMs: number;
}

// In-memory on purpose: one Node process on the host; a restart resetting counters is acceptable.
export function createRateLimiter({ max, windowMs }: Limit, maxKeys = MAX_TRACKED_KEYS) {
  // Map order is least-recently-hit first: every write deletes and re-inserts its key.
  const hits = new Map<string, number[]>();

  function recent(key: string, now: number): number[] {
    const live = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (live.length === 0) hits.delete(key);
    return live;
  }

  function makeRoom(now: number) {
    if (hits.size < maxKeys) return;
    // Clearing everything would hand every throttled client a fresh budget.
    for (const key of [...hits.keys()]) recent(key, now);
    for (const key of hits.keys()) {
      if (hits.size < maxKeys) break;
      hits.delete(key);
    }
  }

  /** Reads the budget without spending it, for limits that only count failures. */
  function isLimited(key: string, now = Date.now()): boolean {
    return recent(key, now).length >= max;
  }

  function hit(key: string, now = Date.now()): void {
    const live = recent(key, now);
    hits.delete(key);
    makeRoom(now);
    live.push(now);
    hits.set(key, live);
  }

  /** Spends one hit if the budget allows; for limits that count every attempt. */
  function allow(key: string, now = Date.now()): boolean {
    if (isLimited(key, now)) return false;
    hit(key, now);
    return true;
  }

  return { isLimited, hit, allow };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
