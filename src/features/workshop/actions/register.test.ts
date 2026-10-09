import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_VERSION, MAX_STAMP_AGE_MS, MIN_FILL_MS, RATE_LIMITS } from '@/config/workshop';
import type { WorkshopEnv } from '@/config/workshopEnv';
import { signStamp } from '../server/formStamp';
import { registerAction, type FormState } from './register';

const SECRET = 's'.repeat(32);
const NOW = 1_800_000_000_000;

const mocks = vi.hoisted(() => ({
  ip: '10.0.0.1',
  register: vi.fn(),
  count: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-test-ip': mocks.ip, 'user-agent': 'vitest' }),
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async () =>
    Object.assign(
      (key: string, vars?: Record<string, unknown>) =>
        vars ? `${key}:${JSON.stringify(vars)}` : key,
      { raw: (key: string) => key }
    ),
}));
vi.mock('@/config/workshopEnv', () => ({
  getWorkshopEnv: () =>
    ({
      WORKSHOP_FORM_SECRET: 's'.repeat(32),
      WORKSHOP_IP_HEADER: 'x-test-ip',
    }) as WorkshopEnv,
}));
vi.mock('../db/client', () => ({ getDb: () => ({}) }));
vi.mock('../db/registrations', () => ({ countActiveRegistrations: mocks.count }));
vi.mock('../server/registerParticipant', () => ({ registerParticipant: mocks.register }));
vi.mock('../server/notify', () => ({ notifyOwner: mocks.notify }));

const idle: FormState = { status: 'idle' };
let ipCounter = 0;

function submission(overrides: Record<string, string> = {}, ageMs = MIN_FILL_MS + 1000): FormData {
  const fd = new FormData();
  const fields: Record<string, string> = {
    fullName: 'Иван Петров',
    email: 'ivan@example.ru',
    company: 'ООО Ромашка',
    positionLevel: 'head',
    consentPd: 'on',
    stamp: signStamp(NOW - ageMs, SECRET),
    ...overrides,
  };
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const submit = (fd: FormData) => registerAction('ai-test', idle, fd);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  // The limiters live in module scope; a fresh address per test keeps budgets independent.
  ipCounter += 1;
  mocks.ip = `10.1.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
  mocks.register.mockReset().mockResolvedValue({ status: 'ok', registrationId: 1, sessionId: 7 });
  mocks.count.mockReset().mockResolvedValue(4);
  mocks.notify.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('registerAction spam filters', () => {
  it('answers a filled honeypot with a fake success and stores nothing', async () => {
    const state = await submit(submission({ website: 'http://spam.example' }));
    expect(state).toEqual({ status: 'success' });
    expect(mocks.register).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('answers a form submitted faster than a person can fill it with a fake success', async () => {
    const state = await submit(submission({}, MIN_FILL_MS - 1));
    expect(state).toEqual({ status: 'success' });
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('accepts a form right at the minimum fill time', async () => {
    await submit(submission({}, MIN_FILL_MS));
    expect(mocks.register).toHaveBeenCalledTimes(1);
  });

  it('asks to reload a form left open longer than the maximum age', async () => {
    const state = await submit(submission({}, MAX_STAMP_AGE_MS + 1));
    expect(state).toMatchObject({ status: 'error', formError: 'errors.reload' });
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', ''],
    ['forged', signStamp(NOW - 10_000, 'x'.repeat(32))],
  ])('asks to reload when the stamp is %s', async (_label, stamp) => {
    const state = await submit(submission({ stamp }));
    expect(state).toMatchObject({ status: 'error', formError: 'errors.reload' });
    expect(mocks.register).not.toHaveBeenCalled();
  });
});

describe('registerAction validation and rate limit', () => {
  it('returns field errors without spending the rate budget', async () => {
    for (let i = 0; i < RATE_LIMITS.register.max + 2; i++) {
      const state = await submit(submission({ email: 'not-an-email' }));
      expect(state).toMatchObject({ status: 'error', fieldErrors: { email: 'errors.email' } });
    }
    await submit(submission());
    expect(mocks.register).toHaveBeenCalledTimes(1);
  });

  it('limits one person after the per-person budget and keeps a colleague working', async () => {
    for (let i = 0; i < RATE_LIMITS.register.max; i++) {
      expect(await submit(submission())).toEqual({ status: 'success' });
    }
    const limited = await submit(submission());
    expect(limited).toMatchObject({ status: 'error', formError: 'errors.rateLimited' });
    expect(mocks.register).toHaveBeenCalledTimes(RATE_LIMITS.register.max);

    expect(await submit(submission({ email: 'colleague@example.ru' }))).toEqual({
      status: 'success',
    });
  });

  it('limits an address that rotates emails once the per-ip budget is spent', async () => {
    for (let i = 0; i < RATE_LIMITS.registerIp.max; i++) {
      await submit(submission({ email: `person${i}@example.ru` }));
    }
    const limited = await submit(submission({ email: 'one-more@example.ru' }));
    expect(limited).toMatchObject({ status: 'error', formError: 'errors.rateLimited' });
  });
});

describe('registerAction outage handling', () => {
  it('does not spend the rate budget while the database is down', async () => {
    mocks.register.mockRejectedValue(new Error('down'));
    for (let i = 0; i < RATE_LIMITS.register.max + 2; i++) {
      expect(await submit(submission())).toMatchObject({ formError: 'errors.unavailable' });
    }
    mocks.register.mockResolvedValue({ status: 'ok', registrationId: 1, sessionId: 7 });
    expect(await submit(submission())).toEqual({ status: 'success' });
  });

  it('bounds a parallel burst from one person to the budget', async () => {
    const results = await Promise.all(
      Array.from({ length: RATE_LIMITS.register.max + 4 }, () => submit(submission()))
    );
    expect(results.filter((r) => r.status === 'success')).toHaveLength(RATE_LIMITS.register.max);
    expect(mocks.register).toHaveBeenCalledTimes(RATE_LIMITS.register.max);
  });

  it('refunds the provisional hit when the database fails', async () => {
    mocks.register.mockRejectedValueOnce(new Error('down'));
    await submit(submission());
    for (let i = 0; i < RATE_LIMITS.register.max; i++) {
      expect(await submit(submission())).toEqual({ status: 'success' });
    }
  });

  it('still spends the budget on a definite answer such as a full session', async () => {
    mocks.register.mockResolvedValue({ status: 'full' });
    for (let i = 0; i < RATE_LIMITS.register.max; i++) await submit(submission());
    expect(await submit(submission())).toMatchObject({ formError: 'errors.rateLimited' });
  });
});

describe('registerAction outcomes', () => {
  it('reports success and pings the owner with the slug and the new count', async () => {
    expect(await submit(submission())).toEqual({ status: 'success' });
    expect(mocks.count).toHaveBeenCalledWith(expect.anything(), 7);
    expect(mocks.notify).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('"slug":"ai-test","count":4')
    );
  });

  it('still reports success when the counter query fails, without a ping', async () => {
    mocks.count.mockRejectedValue(new Error('db hiccup'));
    expect(await submit(submission())).toEqual({ status: 'success' });
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it.each([
    ['full', 'errors.full'],
    ['closed', 'errors.closed'],
    ['not_found', 'errors.closed'],
  ])('maps the %s outcome to %s', async (status, message) => {
    mocks.register.mockResolvedValue({ status });
    expect(await submit(submission())).toMatchObject({ status: 'error', formError: message });
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('answers a database failure with the unavailable message and logs no personal data', async () => {
    mocks.register.mockRejectedValue(new Error('connection to ivan@example.ru lost'));
    expect(await submit(submission())).toMatchObject({
      status: 'error',
      formError: 'errors.unavailable',
    });
    expect(String(vi.mocked(console.error).mock.calls.flat())).not.toContain('ivan@example.ru');
  });

  it('passes the consent audit with the version, the hashes and the client address', async () => {
    await submit(submission());
    const audit = mocks.register.mock.calls[0][3];
    expect(audit).toMatchObject({
      version: CONSENT_VERSION,
      ip: mocks.ip,
      userAgent: 'vitest',
    });
    expect(Object.keys(audit.hashes)).toEqual(['pd_processing', 'marketing', 'portfolio']);
  });
});
