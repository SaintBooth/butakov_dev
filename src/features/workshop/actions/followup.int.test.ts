import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { issueToken } from '../db/tokens';
import { registerParticipant } from '../server/registerParticipant';
import { resolveToken } from '../server/tokenAccess';
import { saveFollowup } from './followup';

let sql: Sql;
let token: string;

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  await seedSession(sql);
  const r = await registerParticipant(
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
  if (r.status !== 'ok') throw new Error('setup');
  token = await issueToken(sql, r.registrationId, 'followup', new Date(), new Date());
});
afterAll(async () => {
  await sql.end();
});

describe('saveFollowup', () => {
  it('stores the answer once and burns the token', async () => {
    const access = await resolveToken(sql, token, 'followup', new Date());
    if (access.state !== 'valid') throw new Error(access.state);
    const input = {
      implemented: 'RAG по базе договоров',
      result: 'минус 30% времени на поиск',
      letterOk: true,
    };
    expect(await saveFollowup(sql, access.ctx, input, new Date())).toBe('saved');
    expect(await saveFollowup(sql, access.ctx, input, new Date())).toBe('duplicate');
    const [row] = await sql`SELECT letter_ok FROM workshop_followups`;
    expect(row.letterOk).toBe(true);
    expect((await resolveToken(sql, token, 'followup', new Date())).state).toBe('used');
  });

  it('shows a second valid token as already used once the answer exists', async () => {
    const access = await resolveToken(sql, token, 'followup', new Date());
    if (access.state !== 'valid') throw new Error(access.state);
    await saveFollowup(sql, access.ctx, { implemented: 'x', letterOk: false }, new Date());
    const [{ id }] = await sql`SELECT id FROM workshop_registrations`;
    const another = await issueToken(sql, id, 'followup', new Date(), new Date());
    expect((await resolveToken(sql, another, 'followup', new Date())).state).toBe('used');
  });
});
