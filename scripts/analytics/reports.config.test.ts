import { describe, expect, it } from 'vitest';
import { LANDING_IDS, LANDING_SLUGS } from '../../src/config/landings';
import { ANALYTICS_EVENTS } from '../../src/features/analytics/events';
import { REPORTS, SEGMENTS } from './reports.config.mjs';

type Step = { type: 'path' | 'event'; value: string };
type Params = { type?: string; value?: string; step?: string; steps?: Step[] };

describe('reports config', () => {
  it('has the expected counts and unique names', () => {
    expect(REPORTS).toHaveLength(15);
    expect(SEGMENTS).toHaveLength(5);
    expect(new Set(REPORTS.map((r) => r.name)).size).toBe(REPORTS.length);
    expect(new Set(SEGMENTS.map((s) => s.name)).size).toBe(SEGMENTS.length);
  });

  it('references only catalog events', () => {
    for (const r of REPORTS) {
      const p = r.parameters as Params;
      const events = [
        ...(r.type === 'goal' && p.type === 'event' && p.value ? [p.value] : []),
        ...(r.type === 'attribution' && p.type === 'event' && p.step ? [p.step] : []),
        ...(p.steps ?? []).filter((s) => s.type === 'event').map((s) => s.value),
      ];
      for (const e of events) expect(ANALYTICS_EVENTS).toContain(e);
    }
  });

  it('keeps funnels within 2..8 steps', () => {
    for (const r of REPORTS.filter((x) => x.type === 'funnel')) {
      const n = (r.parameters as { steps: Step[] }).steps.length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(8);
    }
  });

  it('has a funnel per landing starting at its ru slug', () => {
    for (const id of LANDING_IDS) {
      const f = REPORTS.find((r) => r.name === `Воронка: посадочная ${id}`);
      expect((f?.parameters as { steps: Step[] }).steps[0].value).toBe(
        `/ru/${LANDING_SLUGS[id].ru}`
      );
    }
  });
});
