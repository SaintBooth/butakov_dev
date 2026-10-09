import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  CHECKIN_CLOSES_AFTER_END_MIN,
  CHECKIN_OPENS_BEFORE_END_MIN,
  MINUTE_MS,
} from '@/config/workshop';
import { createTestDb, seedSession } from '@/test/db';
import { registerParticipant } from '../server/registerParticipant';
import { checkIn } from './checkin';

let sql: Sql;
const startsAt = new Date(Date.now() + 86_400_000);
const endsAt = new Date(startsAt.getTime() + 2 * 3_600_000);
const duringWindow = new Date(endsAt.getTime() - 5 * 60_000);

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  await seedSession(sql, { startsAt, endsAt });
  await registerParticipant(
    sql,
    'ai-test',
    {
      fullName: 'Иван',
      email: 'ivan@x.ru',
      company: 'ООО',
      positionLevel: 'head',
      challenges: [],
      topics: [],
      consentPd: true,
      consentMarketing: false,
      consentPortfolio: false,
    },
    {
      version: 'v',
      hashes: { pd_processing: 'a', marketing: 'b', portfolio: 'c' },
      ip: null,
      userAgent: null,
    },
    new Date()
  );
});
afterAll(async () => {
  await sql.end();
});

describe('checkIn', () => {
  it('marks attendance and issues a feedback token inside the window', async () => {
    const r = await checkIn(sql, 'ai-test', { email: 'ivan@x.ru', code: 'AB3K9Z' }, duringWindow);
    expect(r.status).toBe('ok');
    const [reg] = await sql`SELECT status FROM workshop_registrations`;
    expect(reg.status).toBe('attended');
    const [tok] = await sql`SELECT purpose FROM workshop_tokens`;
    expect(tok.purpose).toBe('feedback');
  });

  it('refuses outside the window', async () => {
    const early = new Date(endsAt.getTime() - 60 * 60_000);
    expect(
      (await checkIn(sql, 'ai-test', { email: 'ivan@x.ru', code: 'AB3K9Z' }, early)).status
    ).toBe('closed');
  });

  it('answers the same for a wrong code and an unknown email', async () => {
    expect(
      (await checkIn(sql, 'ai-test', { email: 'ivan@x.ru', code: 'ZZZZZZ' }, duringWindow)).status
    ).toBe('not_found');
    expect(
      (await checkIn(sql, 'ai-test', { email: 'who@x.ru', code: 'AB3K9Z' }, duringWindow)).status
    ).toBe('not_found');
  });

  it('does not issue another feedback token once feedback exists', async () => {
    const first = await checkIn(
      sql,
      'ai-test',
      { email: 'ivan@x.ru', code: 'AB3K9Z' },
      duringWindow
    );
    expect(first.status).toBe('ok');
    await sql`
      INSERT INTO workshop_feedback (registration_id, recommend_score, applicability, wants_review, followup_ok)
      SELECT id, 9, 4, false, false FROM workshop_registrations`;
    const again = await checkIn(
      sql,
      'ai-test',
      { email: 'ivan@x.ru', code: 'AB3K9Z' },
      duringWindow
    );
    expect(again.status).toBe('already_answered');
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM workshop_tokens`;
    expect(n).toBe(1);
  });

  it('does not revive a cancelled registration', async () => {
    await sql`UPDATE workshop_registrations SET status = 'cancelled'`;
    const r = await checkIn(sql, 'ai-test', { email: 'ivan@x.ru', code: 'AB3K9Z' }, duringWindow);
    expect(r.status).toBe('not_found');
    const [reg] = await sql`SELECT status, attended_at FROM workshop_registrations`;
    expect(reg).toMatchObject({ status: 'cancelled', attendedAt: null });
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM workshop_tokens`;
    expect(n).toBe(0);
  });

  it('leaves the registration unattended and issues no token for a wrong code', async () => {
    const r = await checkIn(sql, 'ai-test', { email: 'ivan@x.ru', code: 'ZZZZZZ' }, duringWindow);
    expect(r.status).toBe('not_found');
    const [reg] = await sql`SELECT status, attended_at FROM workshop_registrations`;
    expect(reg).toMatchObject({ status: 'registered', attendedAt: null });
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM workshop_tokens`;
    expect(n).toBe(0);
  });

  it('is open up to the closing minute and closed right after it', async () => {
    const lastMoment = new Date(endsAt.getTime() + CHECKIN_CLOSES_AFTER_END_MIN * MINUTE_MS);
    const justAfter = new Date(lastMoment.getTime() + 1);
    const input = { email: 'ivan@x.ru', code: 'AB3K9Z' };

    expect((await checkIn(sql, 'ai-test', input, justAfter)).status).toBe('closed');
    const [untouched] = await sql`SELECT status FROM workshop_registrations`;
    expect(untouched.status).toBe('registered');

    expect((await checkIn(sql, 'ai-test', input, lastMoment)).status).toBe('ok');
  });

  it('opens exactly at the opening minute and not a millisecond before', async () => {
    const opening = new Date(endsAt.getTime() - CHECKIN_OPENS_BEFORE_END_MIN * MINUTE_MS);
    const input = { email: 'ivan@x.ru', code: 'AB3K9Z' };

    expect((await checkIn(sql, 'ai-test', input, new Date(opening.getTime() - 1))).status).toBe(
      'closed'
    );
    expect((await checkIn(sql, 'ai-test', input, opening)).status).toBe('ok');
  });
});
