import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
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
});
