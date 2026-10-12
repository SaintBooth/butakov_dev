import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import {
  createSession,
  findSessionById,
  listPastSessions,
  listUpcomingSessions,
  sessionCounts,
  sessionSummary,
  updateSession,
} from './sessions';

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

const H = 3_600_000;
const draft = (startsAt: Date) => ({
  title: 'ИИ',
  startsAt,
  endsAt: new Date(startsAt.getTime() + 2 * H),
  meetingUrl: 'https://telemost.yandex.ru/j/1',
  capacity: 30,
});

describe('createSession', () => {
  it('creates with a check-in code and suffixes a taken slug', async () => {
    const at = new Date(Date.now() + 48 * H);
    const a = await createSession(sql, draft(at), 'ai-2026-10-31');
    const b = await createSession(sql, draft(at), 'ai-2026-10-31');
    expect(a.slug).toBe('ai-2026-10-31');
    expect(b.slug).toBe('ai-2026-10-31-2');
    expect(a.checkinCode).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
  });
});

describe('lists and counts', () => {
  it('splits upcoming and past and counts active registrations', async () => {
    const now = new Date();
    await seedSession(sql, {
      slug: 'old-one',
      startsAt: new Date(now.getTime() - 48 * H),
      endsAt: new Date(now.getTime() - 46 * H),
    });
    const up = await seedSession(sql, { slug: 'ai-test' });
    await seedRegistration(sql, 'a@x.ru');
    const regB = await seedRegistration(sql, 'b@x.ru');
    await sql`UPDATE workshop_registrations SET status = 'cancelled' WHERE id = ${regB}`;

    const upcoming = await listUpcomingSessions(sql, now);
    expect(upcoming.map((s) => [s.slug, s.registered])).toEqual([['ai-test', 1]]);
    expect((await listPastSessions(sql, now, 10)).map((s) => s.slug)).toEqual(['old-one']);
    expect(await sessionCounts(sql, up.id)).toEqual({ registered: 1, cancelled: 1, attended: 0 });
  });
});

describe('updateSession', () => {
  it('patches only the given fields', async () => {
    const s = await seedSession(sql);
    await updateSession(sql, s.id, { materialsUrl: 'https://m.ru', registrationOpen: false });
    expect(await findSessionById(sql, s.id)).toMatchObject({
      materialsUrl: 'https://m.ru',
      registrationOpen: false,
      title: 'ИИ в бизнесе',
    });
  });
});

describe('sessionSummary', () => {
  it('reports attendance, feedback and follow-ups', async () => {
    const s = await seedSession(sql);
    const r1 = await seedRegistration(sql, 'a@x.ru');
    await seedRegistration(sql, 'b@x.ru');
    await sql`UPDATE workshop_registrations SET status = 'attended', attended_at = now() WHERE id = ${r1}`;
    await sql`INSERT INTO workshop_feedback (registration_id, recommend_score, applicability) VALUES (${r1}, 9, 4)`;
    await sql`INSERT INTO workshop_email_jobs (registration_id, kind, send_at, status)
              VALUES (${r1}, 'followup', now(), 'sent')`;
    expect(await sessionSummary(sql, s.id)).toEqual({
      registered: 2,
      cancelled: 0,
      attended: 1,
      feedbackCount: 1,
      avgRecommend: 9,
      followupsSent: 1,
      followupsAnswered: 0,
    });
  });
});
