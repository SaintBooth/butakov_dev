import type { Sql } from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import { hashToken } from '../domain/tokens';
import { listAdminParticipants } from './adminView';
import { findViewLinkSession, issueViewLink } from './viewLinks';

let sql: Sql;
let sessionId: number;
beforeAll(async () => {
  sql = await createTestDb();
  sessionId = (await seedSession(sql)).id;
  const r = await seedRegistration(sql, 'anna@x.ru', {
    fullName: 'Анна Кузнецова',
    positionTitle: 'CMO',
  });
  await sql`INSERT INTO workshop_feedback (registration_id, recommend_score, applicability, most_useful)
            VALUES (${r}, 10, 5, 'агенты')`;
});
afterAll(async () => {
  await sql.end();
});

describe('view links', () => {
  it('is valid until it expires and stores only a hash', async () => {
    const now = new Date();
    const token = await issueViewLink(sql, sessionId, now);
    expect(await findViewLinkSession(sql, token, now)).toBe(sessionId);
    expect(await findViewLinkSession(sql, token, new Date(now.getTime() + 31 * 60_000))).toBeNull();
    const [row] =
      await sql`SELECT token_sha256 FROM workshop_view_links WHERE session_id = ${sessionId}`;
    expect(row.tokenSha256).toBe(hashToken(token));
    expect(row.tokenSha256).not.toBe(token);
  });
  it('rejects unknown and oversized tokens', async () => {
    expect(await findViewLinkSession(sql, 'nope', new Date())).toBeNull();
    expect(await findViewLinkSession(sql, 'x'.repeat(500), new Date())).toBeNull();
  });
});

describe('listAdminParticipants', () => {
  it('returns full cards with feedback', async () => {
    expect(await listAdminParticipants(sql, sessionId)).toEqual([
      expect.objectContaining({
        fullName: 'Анна Кузнецова',
        email: 'anna@x.ru',
        positionTitle: 'CMO',
        status: 'registered',
        recommendScore: 10,
        mostUseful: 'агенты',
        followupAnswered: false,
      }),
    ]);
  });
});
