import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YM_ID } from '@/config/analytics';
import { MAX_PENDING, flushPending, resetPendingForTests, track } from './track';

type UmamiStub = { track: ReturnType<typeof vi.fn> };

function stubWindow(extra: Record<string, unknown> = {}) {
  const w = { location: { pathname: '/ru' }, localStorage: { getItem: () => null }, ...extra };
  vi.stubGlobal('window', w);
  return w;
}

describe('track', () => {
  beforeEach(() => {
    resetPendingForTests();
    stubWindow();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends to umami and metrika with the same data', () => {
    const umami = { track: vi.fn() };
    const ym = vi.fn();
    stubWindow({ umami, ym });
    track('lead_open', { placement: 'hero' });
    expect(umami.track).toHaveBeenCalledWith('lead_open', { placement: 'hero' });
    expect(ym).toHaveBeenCalledWith(YM_ID, 'reachGoal', 'lead_open', { placement: 'hero' });
  });

  it('omits data for no-payload events', () => {
    const umami = { track: vi.fn() };
    stubWindow({ umami });
    track('card_visit');
    expect(umami.track).toHaveBeenCalledWith('card_visit', undefined);
  });

  it('queues until umami loads, then flushes in order once', () => {
    const w: { umami?: UmamiStub } = stubWindow();
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
    const w: { umami?: UmamiStub } = stubWindow();
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

  it('sends and queues nothing after consent is declined', () => {
    const umami = { track: vi.fn() };
    const ym = vi.fn();
    const w: { umami?: UmamiStub } = stubWindow({
      ym,
      localStorage: { getItem: (key: string) => (key === 'cookie-consent' ? 'declined' : null) },
    });
    track('card_visit');
    expect(ym).not.toHaveBeenCalled();
    w.umami = umami;
    flushPending();
    expect(umami.track).not.toHaveBeenCalled();
  });

  it('sends and queues nothing on analytics-disabled paths', () => {
    const umami = { track: vi.fn() };
    const ym = vi.fn();
    const w: { umami?: UmamiStub } = stubWindow({
      ym,
      location: { pathname: '/ru/workshop/manage' },
    });
    track('card_visit');
    expect(ym).not.toHaveBeenCalled();
    w.umami = umami;
    flushPending();
    expect(umami.track).not.toHaveBeenCalled();
  });

  it('drops the queue when consent is declined before flush', () => {
    let consent: string | null = null;
    const umami = { track: vi.fn() };
    const w: { umami?: UmamiStub } = stubWindow({ localStorage: { getItem: () => consent } });
    track('card_visit');
    consent = 'declined';
    w.umami = umami;
    flushPending();
    expect(umami.track).not.toHaveBeenCalled();
    consent = 'accepted';
    flushPending();
    expect(umami.track).not.toHaveBeenCalled();
  });
});
