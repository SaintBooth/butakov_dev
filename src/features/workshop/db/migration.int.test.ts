import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb, seedRegistration, seedSession } from '@/test/db';

let sql: Sql;
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

describe('001_workshop migration', () => {
  it('creates the tables and accepts a valid session', async () => {
    const s = await seedSession(sql);
    expect(typeof s.id).toBe('number');
  });

  it('rejects a check-in code with an ambiguous letter', async () => {
    await seedSession(sql);
    await expect(
      sql`UPDATE workshop_sessions SET checkin_code = 'ABCDEL' WHERE slug = 'ai-test'`
    ).rejects.toThrow(/checkin_code/);
  });

  it('rejects an upper-case email', async () => {
    await expect(
      sql`INSERT INTO workshop_participants (email, full_name) VALUES ('A@B.RU', 'x')`
    ).rejects.toThrow(/email/);
  });

  it('rejects a session that ends before it starts, or exactly when it starts', async () => {
    const startsAt = new Date(Date.now() + 86_400_000);
    await expect(
      seedSession(sql, { startsAt, endsAt: new Date(startsAt.getTime() - 60_000) })
    ).rejects.toThrow(/workshop_sessions_check/);
    await expect(seedSession(sql, { startsAt, endsAt: startsAt })).rejects.toThrow(
      /workshop_sessions_check/
    );
  });

  it('rejects a non-positive capacity and a malformed slug', async () => {
    await expect(seedSession(sql, { capacity: 0 })).rejects.toThrow(/capacity/);
    await expect(seedSession(sql, { slug: 'Bad Slug' })).rejects.toThrow(/slug/);
  });

  it('rejects a registration status outside the allowed set', async () => {
    await seedSession(sql);
    await seedRegistration(sql);
    await expect(sql`UPDATE workshop_registrations SET status = 'waitlist'`).rejects.toThrow(
      /status/
    );
  });

  it('rejects an email job status and kind outside the allowed sets', async () => {
    await seedSession(sql);
    await seedRegistration(sql);
    await expect(sql`UPDATE workshop_email_jobs SET status = 'queued'`).rejects.toThrow(/status/);
    await expect(sql`UPDATE workshop_email_jobs SET kind = 'newsletter'`).rejects.toThrow(/kind/);
  });

  it('rejects a consent kind and a token purpose outside the allowed sets', async () => {
    await seedSession(sql);
    const registrationId = await seedRegistration(sql);
    await expect(sql`UPDATE workshop_consents SET kind = 'cookies'`).rejects.toThrow(/kind/);
    await expect(
      sql`INSERT INTO workshop_tokens (registration_id, purpose, token_sha256, expires_at)
          VALUES (${registrationId}, 'admin', 'h', now())`
    ).rejects.toThrow(/purpose/);
  });

  it('enforces the unique keys', async () => {
    await seedSession(sql);
    const registrationId = await seedRegistration(sql);
    await expect(seedSession(sql)).rejects.toThrow(/slug/);
    await expect(
      sql`INSERT INTO workshop_participants (email, full_name) VALUES ('ivan@x.ru', 'Другой')`
    ).rejects.toThrow(/email/);
    await expect(
      sql`INSERT INTO workshop_registrations (session_id, participant_id, company, position_level)
          SELECT session_id, participant_id, 'x', 'head' FROM workshop_registrations`
    ).rejects.toThrow(/session_id/);
    await expect(
      sql`INSERT INTO workshop_email_jobs (registration_id, kind, send_at)
          VALUES (${registrationId}, 'confirmation', now())`
    ).rejects.toThrow(/registration_id/);

    const token = sql`INSERT INTO workshop_tokens (registration_id, purpose, token_sha256, expires_at)
          VALUES (${registrationId}, 'manage', 'same-hash', now())`;
    await token;
    await expect(
      sql`INSERT INTO workshop_tokens (registration_id, purpose, token_sha256, expires_at)
          VALUES (${registrationId}, 'feedback', 'same-hash', now())`
    ).rejects.toThrow(/token_sha256/);
  });

  it('allows one feedback and one follow-up answer per registration', async () => {
    await seedSession(sql);
    const registrationId = await seedRegistration(sql);
    const feedback = () =>
      sql`INSERT INTO workshop_feedback (registration_id, recommend_score, applicability)
          VALUES (${registrationId}, 9, 4)`;
    await feedback();
    await expect(feedback()).rejects.toThrow(/workshop_feedback/);
    await expect(sql`UPDATE workshop_feedback SET recommend_score = 11`).rejects.toThrow(
      /recommend_score/
    );
    await expect(sql`UPDATE workshop_feedback SET applicability = 0`).rejects.toThrow(
      /applicability/
    );
  });
});
