import type { Sql } from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import type { RegistrationInput } from '../schema';
import { registerParticipant } from '../server/registerParticipant';
import { buildExport } from './export';

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

beforeAll(async () => {
  sql = await createTestDb();
  await seedSession(sql);
  await registerParticipant(sql, 'ai-test', person('yes@x.ru', true), audit, new Date());
  await registerParticipant(sql, 'ai-test', person('no@x.ru', false), audit, new Date());
  await registerParticipant(sql, 'ai-test', person('revoked@x.ru', true), audit, new Date());
  await sql`UPDATE workshop_registrations SET status = 'attended', attended_at = now()`;
  await sql`
    INSERT INTO workshop_consents (participant_id, kind, granted, text_version, text_sha256)
    SELECT id, 'portfolio', false, 'v', 'c' FROM workshop_participants WHERE email = 'revoked@x.ru'`;

  // 'yes' and 'revoked' both granted a quote; 'revoked' withdrew it afterwards. 'no' never granted one.
  for (const granted of [true, false]) {
    await sql`
      INSERT INTO workshop_consents (participant_id, kind, granted, text_version, text_sha256)
      SELECT id, 'quote', ${granted}, 'v', 'q' FROM workshop_participants
      WHERE email = 'revoked@x.ru' OR (${granted} AND email = 'yes@x.ru')`;
  }
  await sql`
    INSERT INTO workshop_feedback (registration_id, recommend_score, applicability, testimonial)
    SELECT r.id, 9, 4, p.email FROM workshop_registrations r
    JOIN workshop_participants p ON p.id = r.participant_id`;
});
afterAll(async () => {
  await sql.end();
});

describe('buildExport', () => {
  it('lists only attendees with a current portfolio consent', async () => {
    const out = await buildExport(sql, 'ai-test', 'attendees');
    expect(out?.rows.map((r) => r[1])).toEqual(['yes@x.ru']);
  });

  it('exports feedback only for people whose latest quote consent is granted', async () => {
    const out = await buildExport(sql, 'ai-test', 'feedback');
    expect(out?.rows.map((r) => r[0])).toEqual(['yes@x.ru']);
  });

  it('summarises with absolute numbers and no personal data', async () => {
    const out = await buildExport(sql, 'ai-test', 'summary');
    const map = Object.fromEntries(out!.rows.map(([k, v]) => [String(k), v]));
    expect(map).toMatchObject({ Registered: 3, Attended: 3, 'Companies (distinct)': 1 });
    expect(JSON.stringify(out)).not.toContain('@x.ru');
  });

  it('returns null for an unknown session', async () => {
    expect(await buildExport(sql, 'nope', 'summary')).toBeNull();
  });
});
