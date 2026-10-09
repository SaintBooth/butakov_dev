import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IP_CANDIDATE_HEADERS } from '@/config/workshop';

const TOKEN = 't'.repeat(32);
const mocks = vi.hoisted(() => ({ env: null as unknown, incoming: new Headers() }));

vi.mock('next/headers', () => ({ headers: async () => mocks.incoming }));
vi.mock('@/config/workshopEnv', () => ({ getWorkshopEnv: () => mocks.env }));

const { GET } = await import('./route');

const call = (auth?: string) =>
  GET(
    new Request('http://x/api/workshop/ip-check', { headers: auth ? { authorization: auth } : {} })
  );

beforeEach(() => {
  mocks.env = { WORKSHOP_ADMIN_TOKEN: TOKEN, WORKSHOP_IP_HEADER: 'x-real-ip' };
  mocks.incoming = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'x-real-ip': '9.9.9.9' });
});

describe('GET /api/workshop/ip-check', () => {
  it('is unavailable without a valid workshop env', async () => {
    mocks.env = null;
    const res = await call(`Bearer ${TOKEN}`);
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('refuses a missing or wrong token', async () => {
    mocks.incoming = new Headers({ 'x-real-ip': '8.8.8.8' });
    expect((await call()).status).toBe(401);
    const bad = await call('Bearer nope');
    expect(bad.status).toBe(401);
    expect(bad.headers.get('cache-control')).toBe('no-store');
  });

  it('throttles repeated wrong tokens from one address', async () => {
    mocks.incoming = new Headers({ 'x-real-ip': '7.7.7.7' });
    let last = 0;
    for (let i = 0; i < 12; i++) last = (await call('Bearer bad')).status;
    expect(last).toBe(429);
  });

  it('reports every candidate header raw plus the resolved address', async () => {
    const res = await call(`Bearer ${TOKEN}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(Object.keys(body.headers)).toEqual([...IP_CANDIDATE_HEADERS]);
    expect(body.headers['x-forwarded-for']).toBe('1.2.3.4, 5.6.7.8');
    expect(body.headers.forwarded).toBeNull();
    expect(body.resolved).toBe('9.9.9.9');
  });

  it('resolves to null when no header is configured', async () => {
    mocks.env = { WORKSHOP_ADMIN_TOKEN: TOKEN };
    const body = await (await call(`Bearer ${TOKEN}`)).json();
    expect(body.resolved).toBeNull();
  });
});
