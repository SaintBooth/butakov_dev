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

/**
 * Retention, spec §9: without a portfolio consent → 12 months after the last session;
 * with a consent → 36 months after it was given; a revoked consent counts as none.
 * @param {import('postgres').Sql} sql
 * @param {{ dryRun: boolean, now?: Date }} opts
 * @returns {Promise<number[]>}
 */
export async function purgeParticipants(sql, { dryRun, now = new Date() }) {
  // Selecting inside the transaction: a participant who registers between the SELECT and
  // the DELETEs must not be purged on a stale verdict.
  return sql.begin(async (tx) => {
    const due = await tx`
      WITH latest_portfolio AS (
        SELECT DISTINCT ON (participant_id) participant_id, granted, created_at
        FROM workshop_consents WHERE kind = 'portfolio'
        ORDER BY participant_id, id DESC
      ), last_session AS (
        SELECT r.participant_id, max(s.ends_at) AS last_end
        FROM workshop_registrations r JOIN workshop_sessions s ON s.id = r.session_id
        GROUP BY r.participant_id
      )
      SELECT p.id FROM workshop_participants p
      LEFT JOIN last_session ls ON ls.participant_id = p.id
      LEFT JOIN latest_portfolio lp ON lp.participant_id = p.id
      WHERE (ls.last_end IS NULL OR ls.last_end < ${now}::timestamptz - interval '12 months')
        AND (lp.granted IS NOT TRUE OR lp.created_at < ${now}::timestamptz - interval '36 months')`;
    const ids = due.map((r) => r.id);
    if (dryRun || ids.length === 0) return ids;

    const regs = (await tx`SELECT id FROM workshop_registrations WHERE participant_id = ANY(${ids})`).map((r) => r.id);
    if (regs.length > 0) {
      await tx`DELETE FROM workshop_email_jobs WHERE registration_id = ANY(${regs})`;
      await tx`DELETE FROM workshop_tokens WHERE registration_id = ANY(${regs})`;
      await tx`DELETE FROM workshop_followups WHERE registration_id = ANY(${regs})`;
      await tx`DELETE FROM workshop_feedback WHERE registration_id = ANY(${regs})`;
    }
    await tx`DELETE FROM workshop_consents WHERE participant_id = ANY(${ids})`;
    await tx`DELETE FROM workshop_registrations WHERE participant_id = ANY(${ids})`;
    await tx`DELETE FROM workshop_participants WHERE id = ANY(${ids})`;
    return ids;
  });
}
