import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import type { WorkshopEnv } from '@/config/workshopEnv';

const VOTER = '0b6f3c1e-8f3a-4c2b-9a51-2d7e4f1c9a10';

const mocks = vi.hoisted(() => ({
  ip: '203.0.113.7' as string | null,
  env: true,
  upsert: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: async () => new Headers(mocks.ip ? { 'x-test-ip': mocks.ip } : {}),
}));
vi.mock('@/config/workshopEnv', () => ({
  getWorkshopEnv: () =>
    mocks.env
      ? ({ WORKSHOP_FORM_SECRET: 's'.repeat(32), WORKSHOP_IP_HEADER: 'x-test-ip' } as WorkshopEnv)
      : null,
}));
vi.mock('@/features/workshop/db/client', () => ({ getDb: () => ({}) }));
vi.mock('@/features/workshop/server/notify', () => ({ notifyOwner: mocks.notify }));
vi.mock('@/utils/cases', () => ({ getCaseSlugs: () => ['umami'] }));
vi.mock('../db/feedback', () => ({ upsertFeedback: mocks.upsert }));

// Limiters live in module scope; a fresh module per test keeps every budget independent.
async function action() {
  return (await import('./submitArticleFeedback')).submitArticleFeedback;
}

const yes = { slug: 'umami', locale: 'en', helpful: true, voterId: VOTER };
const noWithText = { ...yes, helpful: false, comment: 'мало кода' };

beforeEach(() => {
  vi.resetModules();
  mocks.ip = '203.0.113.7';
  mocks.env = true;
  mocks.upsert.mockReset().mockResolvedValue(undefined);
  mocks.notify.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('submitArticleFeedback', () => {
  it('stores a vote under a hash, never the raw voter id', async () => {
    expect(await (await action())(yes)).toEqual({ ok: true });
    const [, row] = mocks.upsert.mock.calls[0];
    expect(row).toMatchObject({ slug: 'umami', locale: 'en', helpful: true });
    expect(row.voterHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain(VOTER);
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('pings the owner only for a "no" with text', async () => {
    const submit = await action();
    await submit({ ...yes, helpful: false });
    expect(mocks.notify).not.toHaveBeenCalled();
    await submit(noWithText);
    expect(mocks.notify).toHaveBeenCalledOnce();
    expect(mocks.notify.mock.calls[0][1]).toContain('«мало кода»');
  });

  it('rejects invalid input without touching the database', async () => {
    const submit = await action();
    expect(await submit({ ...yes, slug: 'missing' })).toEqual({ ok: false, reason: 'invalid' });
    expect(await submit('garbage')).toEqual({ ok: false, reason: 'invalid' });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('answers server when the workshop env is unavailable', async () => {
    mocks.env = false;
    expect(await (await action())(yes)).toEqual({ ok: false, reason: 'server' });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('limits votes per IP prefix, so rotating within a /24 does not help', async () => {
    const submit = await action();
    const { max } = JOURNAL_FEEDBACK.rateLimit.votes;
    for (let i = 0; i < max; i++) {
      mocks.ip = `203.0.113.${i % 250}`;
      expect(await submit(yes)).toEqual({ ok: true });
    }
    mocks.ip = '203.0.113.251';
    expect(await submit(yes)).toEqual({ ok: false, reason: 'rate_limited' });
    mocks.ip = '198.51.100.1';
    expect(await submit(yes)).toEqual({ ok: true });
  });

  it('limits comments far tighter than votes', async () => {
    const submit = await action();
    for (let i = 0; i < JOURNAL_FEEDBACK.rateLimit.comments.max; i++) {
      expect(await submit(noWithText)).toEqual({ ok: true });
    }
    expect(await submit(noWithText)).toEqual({ ok: false, reason: 'rate_limited' });
    expect(await submit({ ...yes, helpful: false })).toEqual({ ok: true });
  });

  it('caps owner pings site-wide but still stores the comment', async () => {
    const submit = await action();
    const { max } = JOURNAL_FEEDBACK.rateLimit.notifications;
    for (let i = 0; i <= max; i++) {
      mocks.ip = `10.${i}.0.1`;
      expect(await submit(noWithText)).toEqual({ ok: true });
    }
    expect(mocks.notify).toHaveBeenCalledTimes(max);
    expect(mocks.upsert).toHaveBeenCalledTimes(max + 1);
  });

  it('applies the site-wide ping cap even without a client IP', async () => {
    mocks.ip = null;
    const submit = await action();
    const { max } = JOURNAL_FEEDBACK.rateLimit.notifications;
    for (let i = 0; i <= max; i++) await submit(noWithText);
    expect(mocks.notify).toHaveBeenCalledTimes(max);
  });

  it('refunds the budget when the database fails', async () => {
    const submit = await action();
    mocks.upsert.mockRejectedValue(new Error('db down'));
    for (let i = 0; i < JOURNAL_FEEDBACK.rateLimit.comments.max + 1; i++) {
      expect(await submit(noWithText)).toEqual({ ok: false, reason: 'server' });
    }
    mocks.upsert.mockResolvedValue(undefined);
    expect(await submit(noWithText)).toEqual({ ok: true });
    expect(mocks.notify).toHaveBeenCalledOnce();
  });
});
