import type { Sql } from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDb, seedSession } from '@/test/db';

let sql: Sql;
beforeAll(async () => {
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
    await expect(
      sql`UPDATE workshop_sessions SET checkin_code = 'ABCDEL' WHERE slug = 'ai-test'`
    ).rejects.toThrow();
  });

  it('rejects an upper-case email', async () => {
    await expect(
      sql`INSERT INTO workshop_participants (email, full_name) VALUES ('A@B.RU', 'x')`
    ).rejects.toThrow();
  });
});
