// In-memory on purpose: one Node process on the host; a restart resetting counters is acceptable.
const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return function allow(key: string, now = Date.now()): boolean {
    if (hits.size > MAX_TRACKED_KEYS) hits.clear();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    const allowed = recent.length < max;
    if (allowed) recent.push(now);
    hits.set(key, recent);
    return allowed;
  };
}
