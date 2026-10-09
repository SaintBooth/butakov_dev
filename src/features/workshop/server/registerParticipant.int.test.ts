import postgres, { type Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import type { RegistrationInput } from '../schema';
import { registerParticipant, type ConsentAudit } from './registerParticipant';

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

const audit: ConsentAudit = {
  version: '2026-10-09',
  hashes: { pd_processing: 'h1', marketing: 'h2', portfolio: 'h3' },
  ip: '5.6.7.8',
  userAgent: 'vitest',
};

function input(email: string, extra: Partial<RegistrationInput> = {}): RegistrationInput {
  return {
    fullName: 'Иван Петров',
    email,
    company: 'ООО Ромашка',
    positionLevel: 'head',
    challenges: ['cost'],
    topics: [],
    consentPd: true,
    consentMarketing: false,
    consentPortfolio: true,
    ...extra,
  };
}

describe('registerParticipant', () => {
  it('stores the registration, three consent rows and the email plan', async () => {
    await seedSession(sql);
    const r = await registerParticipant(sql, 'ai-test', input('ivan@x.ru'), audit, new Date());
    expect(r.status).toBe('ok');

    const consents = await sql`SELECT kind, granted FROM workshop_consents ORDER BY id`;
    expect(consents.map((c) => [c.kind, c.granted])).toEqual([
      ['pd_processing', true],
      ['marketing', false],
      ['portfolio', true],
    ]);
    const jobs = await sql`SELECT kind FROM workshop_email_jobs ORDER BY send_at`;
    expect(jobs.map((j) => j.kind)).toEqual([
      'confirmation',
      'reminder_24h',
      'reminder_1h',
      'post_session',
    ]);
    const [reg] = await sql`SELECT challenges, topics FROM workshop_registrations`;
    expect(reg.challenges).toEqual(['cost']);
    expect(reg.topics).toEqual([]);
  });

  it('reports unknown, closed and started sessions', async () => {
    await seedSession(sql, { slug: 'closed-one', registrationOpen: false });
    await seedSession(sql, { slug: 'past-one', startsAt: new Date(Date.now() - 3_600_000) });
    const now = new Date();
    expect((await registerParticipant(sql, 'nope', input('a@x.ru'), audit, now)).status).toBe(
      'not_found'
    );
    expect((await registerParticipant(sql, 'closed-one', input('a@x.ru'), audit, now)).status).toBe(
      'closed'
    );
    expect((await registerParticipant(sql, 'past-one', input('a@x.ru'), audit, now)).status).toBe(
      'closed'
    );
  });

  it('never oversells the last seat under concurrent submits', async () => {
    await seedSession(sql, { capacity: 1 });
    const pool = postgres(process.env.TEST_DATABASE_URL!, { max: 4, transform: postgres.camel });
    const results = await Promise.all(
      ['a@x.ru', 'b@x.ru', 'c@x.ru'].map((e) =>
        registerParticipant(pool, 'ai-test', input(e), audit, new Date())
      )
    );
    await pool.end();
    expect(results.filter((r) => r.status === 'ok')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'full')).toHaveLength(2);
  });

  it('re-registration revives a cancelled registration and its jobs, without a second row', async () => {
    await seedSession(sql);
    const first = await registerParticipant(sql, 'ai-test', input('ivan@x.ru'), audit, new Date());
    if (first.status !== 'ok') throw new Error('setup failed');
    await sql`UPDATE workshop_registrations SET status = 'cancelled'`;
    await sql`UPDATE workshop_email_jobs SET status = 'cancelled'`;

    const again = await registerParticipant(
      sql,
      'ai-test',
      input('ivan@x.ru', { company: 'Новая' }),
      audit,
      new Date()
    );
    expect(again).toMatchObject({ status: 'ok', registrationId: first.registrationId });
    const [reg] = await sql`SELECT status, company FROM workshop_registrations`;
    expect(reg).toMatchObject({ status: 'registered', company: 'Новая' });
    const [pending] =
      await sql`SELECT count(*)::int AS n FROM workshop_email_jobs WHERE status = 'pending'`;
    expect(pending.n).toBe(4);
  });

  it('leaves no participant or consent rows for a rejected registrant and keeps existing names', async () => {
    await seedSession(sql, { capacity: 1 });
    await registerParticipant(sql, 'ai-test', input('ivan@x.ru'), audit, new Date());
    await sql`INSERT INTO workshop_participants (email, full_name) VALUES ('old@x.ru', 'Старое Имя')`;

    const rejected = await registerParticipant(
      sql,
      'ai-test',
      input('new@x.ru'),
      audit,
      new Date()
    );
    const rejectedKnown = await registerParticipant(
      sql,
      'ai-test',
      input('old@x.ru', { fullName: 'Другое Имя' }),
      audit,
      new Date()
    );
    expect([rejected.status, rejectedKnown.status]).toEqual(['full', 'full']);

    const [stray] =
      await sql`SELECT count(*)::int AS n FROM workshop_participants WHERE email = 'new@x.ru'`;
    expect(stray.n).toBe(0);
    const [old] = await sql`SELECT full_name FROM workshop_participants WHERE email = 'old@x.ru'`;
    expect(old.fullName).toBe('Старое Имя');
    const [consents] = await sql`SELECT count(*)::int AS n FROM workshop_consents`;
    expect(consents.n).toBe(3);
  });
});
