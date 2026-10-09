import { randomInt } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

// Keep in sync with src/config/workshop.ts (scripts/workshop/lib.test.ts enforces it).
export const CHECKIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CHECKIN_CODE_LENGTH = 6;

/** @param {(max: number) => number} [pick] */
export function generateCheckinCode(pick = randomInt) {
  let code = '';
  for (let i = 0; i < CHECKIN_CODE_LENGTH; i++) {
    code += CHECKIN_CODE_ALPHABET[pick(CHECKIN_CODE_ALPHABET.length)];
  }
  return code;
}

/** @param {string} [url] */
export function connect(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is not set');
  return postgres(url, { max: 1, transform: postgres.camel, onnotice: () => {} });
}

/**
 * Applies *.sql files from `dir` in name order, each in its own transaction.
 * @param {import('postgres').Sql} sql
 * @param {string} dir
 * @returns {Promise<string[]>} files applied in this run
 */
export async function applyMigrations(sql, dir) {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;
  const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const ran = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const body = await readFile(join(dir, file), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
    });
    ran.push(file);
  }
  return ran;
}
