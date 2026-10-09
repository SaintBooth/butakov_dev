import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { issueToken } from '../db/tokens';
import type { FeedbackInput } from '../schema';
import { registerParticipant } from '../server/registerParticipant';
import { resolveToken } from '../server/tokenAccess';
import { saveFeedback } from './feedback';

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
  await sql`UPDATE workshop_registrations SET status = 'attended'`;
  token = await issueToken(sql, r.registrationId, 'feedback', new Date(), new Date());
});
afterAll(async () => {
  await sql.end();
});

const input: FeedbackInput = {
  recommendScore: 9,
  applicability: 4,
  planToImplement: 'Поиск по регламентам',
  consentQuote: true,
  wantsReview: false,
  followupOk: true,
};

async function validCtx() {
  const access = await resolveToken(sql, token, 'feedback', new Date());
  if (access.state !== 'valid') throw new Error(access.state);
  return access.ctx;
}

describe('saveFeedback', () => {
  it('stores feedback, the quote consent, a follow-up job and burns the token', async () => {
    expect(await saveFeedback(sql, await validCtx(), input, 'qh', new Date())).toBe('saved');
    const [fb] = await sql`SELECT recommend_score FROM workshop_feedback`;
    expect(fb.recommendScore).toBe(9);
    const [quote] = await sql`SELECT granted FROM workshop_consents WHERE kind = 'quote'`;
    expect(quote.granted).toBe(true);
    const [job] = await sql`SELECT status FROM workshop_email_jobs WHERE kind = 'followup'`;
    expect(job.status).toBe('pending');
    expect((await resolveToken(sql, token, 'feedback', new Date())).state).toBe('used');
  });

  it('reports a duplicate instead of overwriting', async () => {
    const ctx = await validCtx();
    await saveFeedback(sql, ctx, input, 'qh', new Date());
    expect(await saveFeedback(sql, ctx, { ...input, recommendScore: 1 }, 'qh', new Date())).toBe(
      'duplicate'
    );
    const [fb] = await sql`SELECT recommend_score FROM workshop_feedback`;
    expect(fb.recommendScore).toBe(9);
  });
});
