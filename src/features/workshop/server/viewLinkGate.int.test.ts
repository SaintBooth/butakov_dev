import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { RATE_LIMITS } from '@/config/workshop';
import { issueViewLink } from '@/features/workshop/db/viewLinks';
import { createTestDb, seedSession } from '@/test/db';
import { checkViewLink, resetViewLinkFailures, viewLinkFailures } from './viewLinkGate';

const IP = '192.0.2.7';
let sql: Sql;

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  resetViewLinkFailures();
});
afterAll(async () => {
  await sql.end();
});

describe('checkViewLink', () => {
  it('returns the session for its own fresh token and spends no budget', async () => {
    const { id, slug } = await seedSession(sql);
    const now = new Date();
    const token = await issueViewLink(sql, id, now);
    const session = await checkViewLink(sql, slug, token, IP, now);
    expect(session?.id).toBe(id);
    expect(viewLinkFailures().isLimited(IP)).toBe(false);
  });

  it('answers null for a token of another session and spends budget', async () => {
    const mine = await seedSession(sql);
    const other = await seedSession(sql, { slug: 'other-one' });
    const now = new Date();
    const foreign = await issueViewLink(sql, other.id, now);
    for (let i = 0; i < RATE_LIMITS.export.max; i++) {
      expect(await checkViewLink(sql, mine.slug, foreign, IP, now)).toBeNull();
    }
    expect(viewLinkFailures().isLimited(IP)).toBe(true);
  });

  it('answers null for an unknown slug and an expired token', async () => {
    const { id, slug } = await seedSession(sql);
    const now = new Date();
    const token = await issueViewLink(sql, id, now);
    expect(await checkViewLink(sql, 'no-such-slug', token, IP, now)).toBeNull();
    const later = new Date(now.getTime() + 24 * 3_600_000);
    expect(await checkViewLink(sql, slug, token, IP, later)).toBeNull();
  });

  it('answers null for a limited ip even with a valid token', async () => {
    const { id, slug } = await seedSession(sql);
    const now = new Date();
    const token = await issueViewLink(sql, id, now);
    for (let i = 0; i < RATE_LIMITS.export.max; i++) viewLinkFailures().hit(IP);
    expect(await checkViewLink(sql, slug, token, IP, now)).toBeNull();
    expect(await checkViewLink(sql, slug, token, null, now)).not.toBeNull();
  });
});
