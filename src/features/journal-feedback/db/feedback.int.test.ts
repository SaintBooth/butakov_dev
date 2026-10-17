import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDb } from '@/test/db';
import { upsertFeedback } from './feedback';

let sql: Sql;

beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
});
afterAll(async () => {
  await sql.end();
});

const vote = { slug: 'umami', locale: 'en' as const, comment: null, voterHash: 'h1' };
const rows = () => sql`SELECT helpful, comment, locale FROM article_feedback ORDER BY id`;

describe('upsertFeedback', () => {
  it('keeps one row per reader and article, the latest answer wins', async () => {
    await upsertFeedback(sql, { ...vote, helpful: true });
    await upsertFeedback(sql, { ...vote, helpful: false, comment: 'мало кода' });
    expect(await rows()).toEqual([{ helpful: false, comment: 'мало кода', locale: 'en' }]);
  });

  it('keeps an earlier comment when a later "no" arrives without one', async () => {
    await upsertFeedback(sql, { ...vote, helpful: false, comment: 'мало кода' });
    await upsertFeedback(sql, { ...vote, helpful: false });
    expect((await rows())[0].comment).toBe('мало кода');
  });

  it('drops the comment when the answer flips to "yes"', async () => {
    await upsertFeedback(sql, { ...vote, helpful: false, comment: 'мало кода' });
    await upsertFeedback(sql, { ...vote, helpful: true });
    expect(await rows()).toEqual([{ helpful: true, comment: null, locale: 'en' }]);
  });

  it('merges both locales of one article for the same reader', async () => {
    await upsertFeedback(sql, { ...vote, helpful: true });
    await upsertFeedback(sql, { ...vote, locale: 'ru', helpful: true });
    expect(await rows()).toEqual([{ helpful: true, comment: null, locale: 'ru' }]);
  });

  it('stores different readers separately', async () => {
    await upsertFeedback(sql, { ...vote, helpful: true });
    await upsertFeedback(sql, { ...vote, voterHash: 'h2', helpful: false });
    expect(await rows()).toHaveLength(2);
  });

  it('rejects an over-long comment at the database level', async () => {
    await expect(
      upsertFeedback(sql, { ...vote, helpful: false, comment: 'x'.repeat(501) })
    ).rejects.toThrow();
  });
});
