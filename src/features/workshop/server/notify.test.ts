import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkshopEnv } from '@/config/workshopEnv';
import { notifyOwner } from './notify';

const TOKEN = 'bot-token-123';
const CHAT = '987654';
const TEXT = 'registered ai-test, 5 total';

const env = { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: CHAT } as WorkshopEnv;

let fetchMock: ReturnType<typeof vi.fn>;
let errorLog: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const loggedText = () => errorLog.mock.calls.flat().join(' ');

describe('notifyOwner', () => {
  it('does nothing when Telegram is not configured', async () => {
    await notifyOwner({} as WorkshopEnv, TEXT);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the text to the bot with a timeout signal', async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: true }));
    await notifyOwner(env, TEXT);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(`/bot${TOKEN}/sendMessage`);
    expect(JSON.parse(init.body)).toEqual({ chat_id: CHAT, text: TEXT });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('logs a rejection when Telegram answers ok:false and does not throw', async () => {
    fetchMock.mockResolvedValue(Response.json({ ok: false, description: 'chat not found' }));
    await expect(notifyOwner(env, TEXT)).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a body that is not JSON', () => new Response('<html>502</html>', { status: 502 })],
    ['a JSON body of the wrong shape', () => Response.json({ result: 'fine' })],
    ['a JSON null', () => Response.json(null)],
  ])('survives %s', async (_label, respond) => {
    fetchMock.mockResolvedValue(respond());
    await expect(notifyOwner(env, TEXT)).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it('survives a timeout and a network failure', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));
    await expect(notifyOwner(env, TEXT)).resolves.toBeUndefined();
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(notifyOwner(env, TEXT)).resolves.toBeUndefined();
    expect(errorLog).toHaveBeenCalledTimes(2);
  });

  it('never writes the token, the chat id or the message text to the log', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ok: false }));
    fetchMock.mockResolvedValueOnce(new Response('nope'));
    fetchMock.mockRejectedValueOnce(new Error(`request to /bot${TOKEN} for ${CHAT} failed`));
    for (let i = 0; i < 3; i++) await notifyOwner(env, TEXT);

    const logged = loggedText();
    expect(errorLog).toHaveBeenCalledTimes(3);
    for (const secret of [TOKEN, CHAT, TEXT]) expect(logged).not.toContain(secret);
  });
});
