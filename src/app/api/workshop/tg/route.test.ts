import { describe, expect, it, vi } from 'vitest';

const handler = vi.fn(async () => new Response(null, { status: 200 }));
let enabled = true;
vi.mock('@/features/workshop/bot/instance', () => ({
  getWebhookHandler: () => (enabled ? handler : null),
}));

const { POST, GET } = await import('./route');
const req = () =>
  new Request('https://butakov.dev/api/workshop/tg', { method: 'POST', body: '{}' });

describe('telegram webhook route', () => {
  it('delegates to grammY when configured', async () => {
    enabled = true;
    expect((await POST(req())).status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });
  it('is a plain 404 when the bot is off', async () => {
    enabled = false;
    expect((await POST(req())).status).toBe(404);
  });
  it('rejects GET', async () => {
    expect((await GET()).status).toBe(405);
  });
});
