import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runPollingSupervisor } from './polling';

const DELAYS = [3, 10, 30];
const HEALTHY_MS = 60;

function setup(outcomes: Array<'reject' | 'resolve'>, opts: { runMs?: number } = {}) {
  let clock = 0;
  let stopped = false;
  let i = 0;
  const sleeps: number[] = [];
  const logs: string[] = [];
  const start = vi.fn(async () => {
    clock += opts.runMs ?? 0;
    const o = outcomes[i++];
    if (i >= outcomes.length) stopped = true;
    if (o === 'reject') throw new Error('Conflict');
  });
  const run = () =>
    runPollingSupervisor({
      start,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      log: (m) => logs.push(m),
      delays: DELAYS,
      healthyMs: HEALTHY_MS,
      now: () => clock,
      isStopped: () => stopped,
    });
  return { run, start, sleeps, logs, tick: (ms: number) => (clock += ms) };
}

describe('runPollingSupervisor', () => {
  it('restarts after a rejection with growing delays, capped at the last one', async () => {
    const t = setup(['reject', 'reject', 'reject', 'reject', 'reject']);
    await t.run();
    expect(t.start).toHaveBeenCalledTimes(5);
    // The final attempt flips isStopped, so no sleep follows it.
    expect(t.sleeps).toEqual([3, 10, 30, 30]);
  });

  it('logs every failure once and never the error message', async () => {
    const t = setup(['reject', 'reject']);
    await t.run();
    expect(t.logs).toHaveLength(2);
    expect(t.logs.join()).not.toContain('Conflict');
    expect(t.logs[0]).toContain('Error');
  });

  it('stops without sleeping once isStopped is true', async () => {
    const t = setup(['resolve']);
    await t.run();
    expect(t.start).toHaveBeenCalledOnce();
    expect(t.sleeps).toEqual([]);
  });

  it('resets the backoff after a run that lasted long enough', async () => {
    const t = setup(['reject', 'reject', 'reject'], { runMs: HEALTHY_MS });
    await t.run();
    expect(t.sleeps).toEqual([3, 3]);
  });
});

describe('startBotPolling', () => {
  const g = globalThis as typeof globalThis & { __workshopBotPollingStarted?: boolean };
  const createWorkshopBot = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    createWorkshopBot.mockReset();
    delete g.__workshopBotPollingStarted;
  });
  afterEach(() => vi.restoreAllMocks());

  async function load(env: Record<string, unknown> | null, db: unknown = {}) {
    vi.doMock('@/config/workshopEnv', () => ({ getWorkshopEnv: () => env }));
    vi.doMock('../db/client', () => ({ getDb: () => db }));
    vi.doMock('./bot', () => ({ createWorkshopBot }));
    return (await import('./polling')).startBotPolling;
  }

  it('does nothing in webhook mode', async () => {
    const start = await load({
      TELEGRAM_BOT_MODE: 'webhook',
      TELEGRAM_BOT_TOKEN: 't',
      TELEGRAM_CHAT_ID: '1',
    });
    start();
    expect(createWorkshopBot).not.toHaveBeenCalled();
  });

  it('does nothing without a token', async () => {
    const start = await load({ TELEGRAM_BOT_MODE: 'polling', TELEGRAM_CHAT_ID: '1' });
    start();
    expect(createWorkshopBot).not.toHaveBeenCalled();
  });

  it('does nothing when the chat id is not an integer', async () => {
    const start = await load({
      TELEGRAM_BOT_MODE: 'polling',
      TELEGRAM_BOT_TOKEN: 't',
      TELEGRAM_CHAT_ID: 'abc',
    });
    start();
    expect(createWorkshopBot).not.toHaveBeenCalled();
  });

  it('does nothing without env or database', async () => {
    (await load(null))();
    expect(createWorkshopBot).not.toHaveBeenCalled();
    delete g.__workshopBotPollingStarted;
    (
      await load(
        { TELEGRAM_BOT_MODE: 'polling', TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' },
        null
      )
    )();
    expect(createWorkshopBot).not.toHaveBeenCalled();
  });

  it('starts one poller and ignores a second call', async () => {
    const bot = {
      catch: vi.fn(),
      start: vi.fn(() => new Promise<void>(() => {})),
      stop: vi.fn(async () => {}),
    };
    createWorkshopBot.mockReturnValue(bot);
    const sigs = vi.spyOn(process, 'once').mockImplementation(() => process);
    const start = await load({
      TELEGRAM_BOT_MODE: 'polling',
      TELEGRAM_BOT_TOKEN: 't',
      TELEGRAM_CHAT_ID: '42',
    });
    start();
    start();
    await Promise.resolve();
    expect(createWorkshopBot).toHaveBeenCalledOnce();
    expect(createWorkshopBot.mock.calls[0][0]).not.toHaveProperty('client');
    expect(bot.catch).toHaveBeenCalledOnce();
    expect(bot.start).toHaveBeenCalledWith({
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false,
    });
    expect(sigs).toHaveBeenCalledTimes(2);
  });
});
