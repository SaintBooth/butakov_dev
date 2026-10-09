import { fileURLToPath } from 'node:url';
import type { Sql } from 'postgres';
import { applyMigrations, connect } from '../../scripts/workshop/lib.mjs';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../db/migrations', import.meta.url));

export async function createTestDb(): Promise<Sql> {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is required for integration tests');
  const sql = connect(url) as unknown as Sql;
  await sql.unsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await applyMigrations(sql, MIGRATIONS_DIR);
  return sql;
}

export async function seedSession(
  sql: Sql,
  overrides: Partial<{
    slug: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    registrationOpen: boolean;
  }> = {}
): Promise<{ id: number; slug: string }> {
  const startsAt = overrides.startsAt ?? new Date(Date.now() + 7 * 86_400_000);
  const row = {
    slug: overrides.slug ?? 'ai-test',
    title: 'ИИ в бизнесе',
    startsAt,
    endsAt: overrides.endsAt ?? new Date(startsAt.getTime() + 2 * 3_600_000),
    meetingUrl: 'https://telemost.yandex.ru/j/123',
    checkinCode: 'AB3K9Z',
    capacity: overrides.capacity ?? 30,
    registrationOpen: overrides.registrationOpen ?? true,
  };
  const [s] = await sql<{ id: number; slug: string }[]>`
    INSERT INTO workshop_sessions ${sql(row)} RETURNING id, slug`;
  return s;
}
