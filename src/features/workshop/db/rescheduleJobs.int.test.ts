import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';
import { rescheduleSession } from './rescheduleJobs';

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});
const H = 3_600_000;
const D = 24 * H;

describe('rescheduleSession', () => {
  it('moves the session, re-plans letters and queues one notice per active registration', async () => {
    const s = await seedSession(sql);
    const active = await seedRegistration(sql, 'a@x.ru');
    const gone = await seedRegistration(sql, 'b@x.ru');
    await sql`UPDATE workshop_registrations SET status = 'cancelled' WHERE id = ${gone}`;
    await sql`UPDATE workshop_email_jobs SET status = 'cancelled' WHERE registration_id = ${gone}`;

    const now = new Date();
    const startsAt = new Date(now.getTime() + 10 * D);
    const endsAt = new Date(startsAt.getTime() + 2 * H);
    expect(await rescheduleSession(sql, s.id, startsAt, endsAt, now)).toEqual({
      status: 'ok',
      notified: 1,
    });

    const jobs = await sql<
      { registrationId: number; kind: string; status: string; sendAt: Date }[]
    >`
      SELECT registration_id, kind, status, send_at FROM workshop_email_jobs`;
    const mine = Object.fromEntries(
      jobs.filter((j) => j.registrationId === active).map((j) => [j.kind, j])
    );
    expect(mine.reminder_24h.sendAt).toEqual(new Date(startsAt.getTime() - D));
    expect(mine.rescheduled.status).toBe('pending');
    const theirs = jobs.filter((j) => j.registrationId === gone);
    expect(theirs.every((j) => j.status === 'cancelled')).toBe(true);
    expect(theirs.some((j) => j.kind === 'rescheduled')).toBe(false);
  });

  it('re-queues the notice on a second reschedule', async () => {
    const s = await seedSession(sql);
    await seedRegistration(sql, 'a@x.ru');
    const now = new Date();
    const at = (days: number) => new Date(now.getTime() + days * D);
    await rescheduleSession(sql, s.id, at(10), new Date(at(10).getTime() + H), now);
    await sql`UPDATE workshop_email_jobs SET status = 'sent' WHERE kind = 'rescheduled'`;
    await rescheduleSession(sql, s.id, at(12), new Date(at(12).getTime() + H), now);
    const [j] = await sql`SELECT status FROM workshop_email_jobs WHERE kind = 'rescheduled'`;
    expect(j.status).toBe('pending');
  });

  it('refuses a new start that has meanwhile passed', async () => {
    const s = await seedSession(sql);
    const [before] = await sql`SELECT starts_at FROM workshop_sessions WHERE id = ${s.id}`;
    const now = new Date();
    expect(
      await rescheduleSession(
        sql,
        s.id,
        new Date(now.getTime() - H),
        new Date(now.getTime() + H),
        now
      )
    ).toEqual({ status: 'past' });
    const [row] = await sql`SELECT starts_at FROM workshop_sessions WHERE id = ${s.id}`;
    expect(row.startsAt).toEqual(before.startsAt);
  });

  it('refuses once the session has started', async () => {
    const now = new Date();
    const s = await seedSession(sql, {
      startsAt: new Date(now.getTime() - H),
      endsAt: new Date(now.getTime() + H),
    });
    expect(
      await rescheduleSession(
        sql,
        s.id,
        new Date(now.getTime() + 5 * H),
        new Date(now.getTime() + 6 * H),
        now
      )
    ).toEqual({ status: 'started' });
  });
});
