import { createHash } from 'node:crypto';
import { CONSENT_KINDS } from '@/config/workshop';

export type ConsentKind = (typeof CONSENT_KINDS)[number];

export interface ConsentEvent {
  kind: ConsentKind;
  granted: boolean;
  createdAt: Date;
}

export type ConsentState = Record<ConsentKind, boolean>;

export function currentConsents(events: ConsentEvent[]): ConsentState {
  const state = Object.fromEntries(CONSENT_KINDS.map((kind) => [kind, false])) as ConsentState;
  const latest = new Map<ConsentKind, number>();
  for (const e of events) {
    const at = e.createdAt.getTime();
    const prev = latest.get(e.kind);
    if (prev === undefined || at >= prev) {
      latest.set(e.kind, at);
      state[e.kind] = e.granted;
    }
  }
  return state;
}

export function consentTextHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
