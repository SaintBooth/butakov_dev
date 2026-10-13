import { YM_ID } from '@/config/analytics';
import { EVENT_SCHEMAS, type AnalyticsEvent, type EventData } from './events';

export const MAX_PENDING = 50;

type Payload = Record<string, unknown> | undefined;
let pending: [AnalyticsEvent, Payload][] = [];

// Events without a payload may be called as track('card_visit'); others require data.
type DataArgs<E extends AnalyticsEvent> =
  Record<string, never> extends EventData<E> ? [data?: EventData<E>] : [data: EventData<E>];

/**
 * Single entry point for analytics goals: validates against the catalog, sends to Umami
 * (queued until its deferred script loads) and mirrors to Metrika's reachGoal.
 */
export function track<E extends AnalyticsEvent>(event: E, ...[data]: DataArgs<E>): void {
  if (typeof window === 'undefined') return;
  const parsed = EVENT_SCHEMAS[event].safeParse(data ?? {});
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`analytics: invalid data for ${event}: ${parsed.error.message}`);
    }
    return;
  }
  const payload: Payload = Object.keys(parsed.data).length ? parsed.data : undefined;

  if (window.umami) window.umami.track(event, payload);
  else if (pending.length < MAX_PENDING) pending.push([event, payload]);

  if (typeof window.ym === 'function') window.ym(YM_ID, 'reachGoal', event, payload);
}

/** Called once Umami's script has loaded; sends what was tracked before it existed. */
export function flushPending(): void {
  if (typeof window === 'undefined' || !window.umami) return;
  const queued = pending;
  pending = [];
  for (const [event, payload] of queued) window.umami.track(event, payload);
}

export function resetPendingForTests(): void {
  pending = [];
}
