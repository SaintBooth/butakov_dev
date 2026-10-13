import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YM_ID } from '@/config/analytics';
import { MAX_PENDING, flushPending, resetPendingForTests, track } from './track';

type UmamiStub = { track: ReturnType<typeof vi.fn> };

describe('track', () => {
  beforeEach(() => {
    resetPendingForTests();
    vi.stubGlobal('window', {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends to umami and metrika with the same data', () => {
    const umami = { track: vi.fn() };
    const ym = vi.fn();
    vi.stubGlobal('window', { umami, ym });
    track('lead_open', { placement: 'hero' });
    expect(umami.track).toHaveBeenCalledWith('lead_open', { placement: 'hero' });
    expect(ym).toHaveBeenCalledWith(YM_ID, 'reachGoal', 'lead_open', { placement: 'hero' });
  });

  it('omits data for no-payload events', () => {
    const umami = { track: vi.fn() };
    vi.stubGlobal('window', { umami });
    track('card_visit');
    expect(umami.track).toHaveBeenCalledWith('card_visit', undefined);
  });

  it('queues until umami loads, then flushes in order once', () => {
    const w: { umami?: UmamiStub } = {};
    vi.stubGlobal('window', w);
    track('card_visit');
    track('not_found', { path: '/x' });
    w.umami = { track: vi.fn() };
    flushPending();
    expect(w.umami.track.mock.calls).toEqual([
      ['card_visit', undefined],
      ['not_found', { path: '/x' }],
    ]);
    flushPending();
    expect(w.umami.track).toHaveBeenCalledTimes(2);
  });

  it('caps the queue', () => {
    const w: { umami?: UmamiStub } = {};
    vi.stubGlobal('window', w);
    for (let i = 0; i < MAX_PENDING + 10; i++) track('card_visit');
    w.umami = { track: vi.fn() };
    flushPending();
    expect(w.umami.track).toHaveBeenCalledTimes(MAX_PENDING);
  });

  it('throws on invalid data outside production', () => {
    // @ts-expect-error — invalid placement on purpose
    expect(() => track('lead_open', { placement: 'nope' })).toThrow(/lead_open/);
  });

  it('is a no-op without window', () => {
    vi.unstubAllGlobals();
    expect(() => track('card_visit')).not.toThrow();
  });
});
