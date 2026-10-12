import type { Sql } from 'postgres';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';
import { runSummaryTick } from './summary';

let sql: Sql;
let sent: string[];
beforeEach(async () => {
  if (sql) await sql.end();
  sql = await createTestDb();
  sent = [];
});
afterAll(async () => {
  await sql.end();
});
const notify = async (t: string) => {
  sent.push(t);
};
const tick = (iso: string) => runSummaryTick({ db: sql, now: () => new Date(iso), notify });

describe('runSummaryTick', () => {
  // Ends 31.10 21:00 МСК → due 01.11 10:00 МСК = 07:00Z.
  const endsAt = new Date('2026-10-31T18:00:00Z');
  const seed = () =>
    seedSession(sql, { slug: 'ai-x', startsAt: new Date(endsAt.getTime() - 7_200_000), endsAt });

  it('waits until 10:00 Moscow the next day, then sends once', async () => {
    await seed();
    expect(await tick('2026-11-01T06:59:00Z')).toBe(0);
    expect(await tick('2026-11-01T07:00:00Z')).toBe(1);
    expect(await tick('2026-11-01T08:00:00Z')).toBe(0);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain('ИИ в бизнесе');
  });

  it('keeps going when one send fails', async () => {
    await seed();
    await seedSession(sql, {
      slug: 'ai-y',
      startsAt: new Date(endsAt.getTime() - 7_200_000),
      endsAt,
    });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    let calls = 0;
    const flaky = async (t: string) => {
      if (calls++ === 0) throw new Error('telegram down');
      sent.push(t);
    };
    await runSummaryTick({ db: sql, now: () => new Date('2026-11-01T07:00:00Z'), notify: flaky });
    expect(sent).toHaveLength(1);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('skips sessions older than the age limit', async () => {
    await seed();
    expect(await tick('2026-11-10T07:00:00Z')).toBe(0);
  });
});
