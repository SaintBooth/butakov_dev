import type { Sql } from 'postgres';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkshopEnv } from '@/config/workshopEnv';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import { issueToken, type TokenContext } from '../db/tokens';
import { resolveToken } from '../server/tokenAccess';
import { followupAction } from './followup';

const hooks = vi.hoisted(() => ({
  db: null as unknown,
  notify: vi.fn(),
  forcedCtx: null as unknown,
}));

vi.mock('next-intl/server', () => ({
  getTranslations: async () =>
    Object.assign(
      (key: string, vars?: Record<string, unknown>) =>
        vars ? `${key}:${JSON.stringify(vars)}` : key,
      { raw: (key: string) => key }
    ),
}));
vi.mock('@/config/workshopEnv', () => ({ getWorkshopEnv: () => ({}) as WorkshopEnv }));
vi.mock('../db/client', () => ({ getDb: () => hooks.db }));
vi.mock('../server/notify', () => ({ notifyOwner: hooks.notify }));
// Lets one test reach the duplicate branch, which a concurrent submit would otherwise hit.
vi.mock('../server/tokenAccess', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../server/tokenAccess')>();
  return {
    ...actual,
    resolveToken: (...args: Parameters<typeof actual.resolveToken>) =>
      hooks.forcedCtx
        ? Promise.resolve({ state: 'valid' as const, ctx: hooks.forcedCtx as TokenContext })
        : actual.resolveToken(...args),
  };
});

let sql: Sql;
let registrationId: number;
let token: string;

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  hooks.db = sql;
  hooks.forcedCtx = null;
  hooks.notify.mockReset().mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await seedSession(sql);
  registrationId = await seedRegistration(sql);
  token = await issueToken(sql, registrationId, 'followup', new Date(), new Date());
});
afterEach(() => {
  vi.restoreAllMocks();
});
afterAll(async () => {
  await sql.end();
});

function answer(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const submit = (fields: Record<string, string>, withToken = token) =>
  followupAction(withToken, { status: 'idle' }, answer(fields));

const answers = async () => (await sql`SELECT letter_ok FROM workshop_followups`).length;

describe('followupAction', () => {
  it('refuses an expired token and stores nothing', async () => {
    await sql`UPDATE workshop_tokens SET expires_at = now() - interval '1 second'`;
    const state = await submit({ implemented: 'RAG' });
    expect(state).toMatchObject({ status: 'error', formError: 'token.expired' });
    expect(await answers()).toBe(0);
  });

  it('refuses an unknown token', async () => {
    const state = await submit({ implemented: 'RAG' }, 'no-such-token');
    expect(state).toMatchObject({ status: 'error', formError: 'token.invalid' });
  });

  it('asks for an answer when both fields are empty and keeps the token usable', async () => {
    const state = await submit({ implemented: '  ', result: '' });
    expect(state).toMatchObject({
      status: 'error',
      fieldErrors: { implemented: 'errors.followupEmpty' },
    });
    expect(await answers()).toBe(0);
    expect((await resolveToken(sql, token, 'followup', new Date())).state).toBe('valid');
  });

  it('stores the answer, burns the token and pings the owner with the id only', async () => {
    const state = await submit({ implemented: 'RAG по договорам', letterOk: 'on' });
    expect(state).toEqual({ status: 'success' });
    expect(await answers()).toBe(1);
    expect((await resolveToken(sql, token, 'followup', new Date())).state).toBe('used');

    expect(hooks.notify).toHaveBeenCalledTimes(1);
    const text = String(hooks.notify.mock.calls[0][1]);
    expect(text).toContain(`"registrationId":${registrationId}`);
    expect(text).not.toContain('RAG по договорам');
  });

  it('does not ping the owner when the participant declined the letter', async () => {
    expect(await submit({ result: 'Сэкономили неделю' })).toEqual({ status: 'success' });
    expect(hooks.notify).not.toHaveBeenCalled();
  });

  it('answers a second token for an answered registration with the used message', async () => {
    await submit({ implemented: 'RAG' });
    const emailed = await issueToken(sql, registrationId, 'followup', new Date(), new Date());
    const state = await submit({ implemented: 'again' }, emailed);
    expect(state).toMatchObject({ status: 'error', formError: 'token.used' });
    expect(await answers()).toBe(1);
  });

  it('answers a lost race with the used message and does not ping', async () => {
    await submit({ implemented: 'first' });
    hooks.notify.mockClear();
    const [ctx] = await sql<TokenContext[]>`
      SELECT t.id AS token_id, r.id AS registration_id, p.id AS participant_id
      FROM workshop_tokens t
      JOIN workshop_registrations r ON r.id = t.registration_id
      JOIN workshop_participants p ON p.id = r.participant_id`;
    hooks.forcedCtx = ctx;

    const state = await submit({ implemented: 'second', letterOk: 'on' });
    expect(state).toMatchObject({ status: 'error', formError: 'token.used' });
    expect(hooks.notify).not.toHaveBeenCalled();
    expect(await answers()).toBe(1);
  });
});
