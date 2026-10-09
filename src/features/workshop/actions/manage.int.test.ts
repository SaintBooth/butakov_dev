import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { issueToken } from '../db/tokens';
import { registerParticipant } from '../server/registerParticipant';
import { resolveToken } from '../server/tokenAccess';
import { applyManageIntent } from './manage';

let sql: Sql;
let token: string;
const audit = { version: 'v', hashes: { marketing: 'b', portfolio: 'c', quote: 'd' } };

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  const s = await seedSession(sql);
  const r = await registerParticipant(
    sql,
    s.slug,
    {
      fullName: 'Иван',
      email: 'ivan@x.ru',
      company: 'ООО',
      positionLevel: 'head',
      challenges: [],
      topics: [],
      consentPd: true,
      consentMarketing: true,
      consentPortfolio: true,
    },
    {
      version: 'v',
      hashes: { pd_processing: 'a', marketing: 'b', portfolio: 'c' },
      ip: null,
      userAgent: null,
    },
    new Date()
  );
  if (r.status !== 'ok') throw new Error('setup');
  token = await issueToken(
    sql,
    r.registrationId,
    'manage',
    new Date(Date.now() + 86_400_000),
    new Date()
  );
});
afterAll(async () => {
  await sql.end();
});

async function ctx() {
  const access = await resolveToken(sql, token, 'manage', new Date());
  if (access.state !== 'valid') throw new Error(access.state);
  return access.ctx;
}

describe('manage intents', () => {
  it('rejects unknown, missing and wrong-purpose tokens', async () => {
    expect((await resolveToken(sql, 'nope', 'manage', new Date())).state).toBe('invalid');
    expect((await resolveToken(sql, undefined, 'manage', new Date())).state).toBe('invalid');
    expect((await resolveToken(sql, token, 'feedback', new Date())).state).toBe('invalid');
  });

  it('cancel stops pending emails', async () => {
    await applyManageIntent(sql, await ctx(), 'cancel', audit);
    const [reg] = await sql`SELECT status FROM workshop_registrations`;
    expect(reg.status).toBe('cancelled');
    const [n] =
      await sql`SELECT count(*)::int AS n FROM workshop_email_jobs WHERE status = 'pending'`;
    expect(n.n).toBe(0);
  });

  it('cancel on an attended registration is a no-op that keeps pending emails', async () => {
    await sql`UPDATE workshop_registrations SET status = 'attended'`;
    // The follow-up job is only queued once the session is over; add it as that flow would.
    await sql`
      INSERT INTO workshop_email_jobs (registration_id, kind, send_at)
      SELECT id, 'followup', now() + interval '45 days' FROM workshop_registrations`;
    const [before] =
      await sql`SELECT count(*)::int AS n FROM workshop_email_jobs WHERE status = 'pending'`;
    expect(before.n).toBeGreaterThan(0);
    const applied = await applyManageIntent(sql, await ctx(), 'cancel', audit);
    expect(applied).toBe(false);
    const [reg] = await sql`SELECT status FROM workshop_registrations`;
    expect(reg.status).toBe('attended');
    const [after] =
      await sql`SELECT count(*)::int AS n FROM workshop_email_jobs WHERE status = 'pending'`;
    expect(after.n).toBe(before.n);
    const kept = await sql`
      SELECT kind FROM workshop_email_jobs WHERE status = 'pending' AND kind IN ('post_session', 'followup')`;
    expect(kept.map((j) => j.kind).sort()).toEqual(['followup', 'post_session']);
  });

  it('revoke appends false rows for portfolio and quote', async () => {
    await applyManageIntent(sql, await ctx(), 'revoke', audit);
    const rows = await sql`SELECT kind FROM workshop_consents WHERE granted = false ORDER BY id`;
    expect(rows.map((r) => r.kind)).toEqual(['portfolio', 'quote']);
  });

  it('unsubscribe appends a false marketing row', async () => {
    await applyManageIntent(sql, await ctx(), 'unsubscribe', audit);
    const [row] =
      await sql`SELECT granted FROM workshop_consents WHERE kind = 'marketing' ORDER BY id DESC LIMIT 1`;
    expect(row.granted).toBe(false);
  });
});
