import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { purgeParticipants } from '../../../../scripts/workshop/lib.mjs';
import type { RegistrationInput } from '../schema';
import { registerParticipant } from '../server/registerParticipant';

let sql: Sql;
const audit = {
  version: 'v',
  hashes: { pd_processing: 'a', marketing: 'b', portfolio: 'c' },
  ip: null,
  userAgent: null,
};
const person = (email: string, consentPortfolio: boolean): RegistrationInput => ({
  fullName: email,
  email,
  company: 'ООО',
  positionLevel: 'head',
  challenges: [],
  topics: [],
  consentPd: true,
  consentMarketing: false,
  consentPortfolio,
});

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  await seedSession(sql);
  await registerParticipant(sql, 'ai-test', person('keep@x.ru', true), audit, new Date());
  await registerParticipant(sql, 'ai-test', person('drop@x.ru', false), audit, new Date());
  // Move the session 13 months into the past.
  await sql`UPDATE workshop_sessions SET starts_at = now() - interval '13 months 2 hours', ends_at = now() - interval '13 months'`;
});
afterAll(async () => {
  await sql.end();
});

describe('purgeParticipants', () => {
  it('dry run reports without deleting', async () => {
    const ids = await purgeParticipants(sql, { dryRun: true });
    expect(ids).toHaveLength(1);
    const [n] = await sql`SELECT count(*)::int AS n FROM workshop_participants`;
    expect(n.n).toBe(2);
  });

  it('deletes everything about participants without a portfolio consent', async () => {
    await purgeParticipants(sql, { dryRun: false });
    const left = await sql`SELECT email FROM workshop_participants`;
    expect(left.map((r) => r.email)).toEqual(['keep@x.ru']);
    const [orphans] = await sql`
      SELECT count(*)::int AS n FROM workshop_email_jobs j
      LEFT JOIN workshop_registrations r ON r.id = j.registration_id WHERE r.id IS NULL`;
    expect(orphans.n).toBe(0);
  });
});
