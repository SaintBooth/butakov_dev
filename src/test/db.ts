import { fileURLToPath } from 'node:url';
import type { Sql } from 'postgres';
import { applyMigrations, connect } from '../../scripts/workshop/lib.mjs';
import type { RegistrationInput } from '../features/workshop/schema';
import {
  registerParticipant,
  type ConsentAudit,
} from '../features/workshop/server/registerParticipant';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../db/migrations', import.meta.url));

export async function createTestDb(): Promise<Sql> {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is required for integration tests');
  // The next statement drops the whole public schema; never aim it at a real database.
  if (!new URL(url).pathname.endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL must point to a database whose name ends with _test');
  }
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

export const TEST_AUDIT: ConsentAudit = {
  version: 'v',
  hashes: { pd_processing: 'a', marketing: 'b', portfolio: 'c' },
  ip: null,
  userAgent: null,
};

export function testRegistrationInput(
  email: string,
  extra: Partial<RegistrationInput> = {}
): RegistrationInput {
  return {
    fullName: 'Иван',
    email,
    company: 'ООО',
    positionLevel: 'head',
    challenges: [],
    topics: [],
    consentPd: true,
    consentMarketing: false,
    consentPortfolio: false,
    ...extra,
  };
}

export async function seedRegistration(
  sql: Sql,
  email = 'ivan@x.ru',
  extra: Partial<RegistrationInput> = {},
  slug = 'ai-test'
): Promise<number> {
  const r = await registerParticipant(
    sql,
    slug,
    testRegistrationInput(email, extra),
    TEST_AUDIT,
    new Date()
  );
  if (r.status !== 'ok') throw new Error(`seedRegistration: ${r.status}`);
  return r.registrationId;
}
