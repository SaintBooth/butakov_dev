import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb } from '@/test/db';
import { purgeParticipants } from '../../../../scripts/workshop/lib.mjs';

const NOW = new Date('2030-01-01T00:00:00Z');
const monthsAgo = (n: number) => {
  const d = new Date(NOW);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d;
};

type Consent = { kind: 'portfolio' | 'quote'; granted: boolean; monthsAgo: number };
let sql: Sql;
let seq = 0;

// One participant per case, one registration per listed session end.
async function person(sessionsEndedMonthsAgo: number[], consents: Consent[]): Promise<string> {
  const email = `p${++seq}@x.ru`;
  const [{ id: participantId }] = await sql`
    INSERT INTO workshop_participants (email, full_name) VALUES (${email}, 'Тест') RETURNING id`;
  for (const m of sessionsEndedMonthsAgo) {
    const [{ id: sessionId }] = await sql`
      INSERT INTO workshop_sessions (slug, title, starts_at, ends_at, meeting_url, checkin_code)
      VALUES (${`s-${seq}-${m}`}, 'T', ${monthsAgo(m + 1)}, ${monthsAgo(m)}, 'https://x.ru', 'AB3K9Z')
      RETURNING id`;
    await sql`
      INSERT INTO workshop_registrations (participant_id, session_id, company, position_level)
      VALUES (${participantId}, ${sessionId}, 'ООО', 'head')`;
  }
  for (const c of consents) {
    await sql`
      INSERT INTO workshop_consents (participant_id, kind, granted, text_version, text_sha256, created_at)
      VALUES (${participantId}, ${c.kind}, ${c.granted}, 'v', 'h', ${monthsAgo(c.monthsAgo)})`;
  }
  return email;
}

async function purged(emails: string[]): Promise<string[]> {
  await purgeParticipants(sql, { dryRun: false, now: NOW });
  const left = new Set((await sql`SELECT email FROM workshop_participants`).map((r) => r.email));
  return emails.filter((e) => !left.has(e));
}

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

describe('purgeParticipants retention', () => {
  it('keeps a portfolio consent younger than 36 months and drops an older one', async () => {
    const young = await person([40], [{ kind: 'portfolio', granted: true, monthsAgo: 35 }]);
    const old = await person([40], [{ kind: 'portfolio', granted: true, monthsAgo: 37 }]);
    expect(await purged([young, old])).toEqual([old]);
  });

  it('keeps a participant who only gave the quote consent', async () => {
    const quote = await person([13], [{ kind: 'quote', granted: true, monthsAgo: 12 }]);
    const stale = await person([40], [{ kind: 'quote', granted: true, monthsAgo: 38 }]);
    expect(await purged([quote, stale])).toEqual([stale]);
  });

  it('treats a revoked latest consent as none, per kind', async () => {
    const revoked = await person(
      [13],
      [
        { kind: 'portfolio', granted: true, monthsAgo: 14 },
        { kind: 'portfolio', granted: false, monthsAgo: 13 },
      ]
    );
    const quoteSurvives = await person(
      [13],
      [
        { kind: 'portfolio', granted: false, monthsAgo: 13 },
        { kind: 'quote', granted: true, monthsAgo: 12 },
      ]
    );
    expect(await purged([revoked, quoteSurvives])).toEqual([revoked]);
  });

  it('keeps anyone whose last session ended less than 12 months ago', async () => {
    const recent = await person([11], []);
    const old = await person([13], []);
    expect(await purged([recent, old])).toEqual([old]);
  });

  it('measures the 12 months from the latest of several sessions', async () => {
    const mixed = await person([30, 3], []);
    const allOld = await person([30, 14], []);
    expect(await purged([mixed, allOld])).toEqual([allOld]);
  });
});
