import { beforeEach, describe, expect, it, vi } from 'vitest';

const g = globalThis as typeof globalThis & { __workshopBotHandler?: unknown };
const createWorkshopBot = vi.fn(() => ({}));

async function load(mode: 'polling' | 'webhook') {
  vi.resetModules();
  delete g.__workshopBotHandler;
  vi.doMock('@/config/workshopEnv', () => ({
    getWorkshopEnv: () => ({
      TELEGRAM_BOT_MODE: mode,
      TELEGRAM_BOT_TOKEN: 't',
      TELEGRAM_CHAT_ID: '1',
      TELEGRAM_WEBHOOK_SECRET: 's'.repeat(32),
    }),
  }));
  vi.doMock('../db/client', () => ({ getDb: () => ({}) }));
  vi.doMock('./bot', () => ({ createWorkshopBot }));
  vi.doMock('grammy', () => ({ webhookCallback: () => async () => new Response() }));
  return (await import('./instance')).getWebhookHandler;
}

describe('getWebhookHandler', () => {
  beforeEach(() => createWorkshopBot.mockClear());

  it('is null in polling mode, so a stale webhook never runs a second bot', async () => {
    expect((await load('polling'))()).toBeNull();
    expect(createWorkshopBot).not.toHaveBeenCalled();
  });
  it('builds the handler in webhook mode', async () => {
    expect((await load('webhook'))()).toBeTypeOf('function');
  });
});
