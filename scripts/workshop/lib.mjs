import { randomInt } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
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

export const CREATE_SESSION_USAGE = `usage: node scripts/workshop/create-session.mjs --slug ai-2026-10 --title "ИИ в бизнесе и жизни" \\
  --starts 2026-10-20T15:00:00+03:00 --ends 2026-10-20T17:00:00+03:00 --meeting https://telemost.yandex.ru/j/... [--capacity 30]`;

// The offset is mandatory: without it Date() would read the time in the machine's own zone.
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** @param {string} name @param {string} value */
function parseInstant(name, value) {
  const at = new Date(value);
  if (!ISO_WITH_OFFSET.test(value) || Number.isNaN(at.getTime())) {
    throw new Error(`--${name} must be an ISO date-time with an offset, e.g. 2026-10-20T15:00:00+03:00`);
  }
  return at;
}

/**
 * @param {string[]} argv
 * @returns {{ slug: string, title: string, startsAt: Date, endsAt: Date, meetingUrl: string, capacity?: number }}
 * @throws {Error} with a message fit to print as is
 */
export function parseCreateSessionArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      slug: { type: 'string' },
      title: { type: 'string' },
      starts: { type: 'string' },
      ends: { type: 'string' },
      meeting: { type: 'string' },
      capacity: { type: 'string' },
    },
  });
  if (!values.slug || !values.title || !values.starts || !values.ends || !values.meeting) {
    throw new Error(CREATE_SESSION_USAGE);
  }
  const startsAt = parseInstant('starts', values.starts);
  const endsAt = parseInstant('ends', values.ends);
  if (endsAt <= startsAt) throw new Error('--ends must be later than --starts');
  const session = { slug: values.slug, title: values.title, startsAt, endsAt, meetingUrl: values.meeting };
  if (values.capacity === undefined) return session;
  // Left out when absent: the column default is the single source for the usual capacity.
  if (!/^[1-9]\d*$/.test(values.capacity)) throw new Error('--capacity must be a positive integer');
  return { ...session, capacity: Number(values.capacity) };
}

/** @param {Record<string, string | undefined>} [env] */
export function readSiteUrl(env = process.env) {
  if (!env.SITE_URL) throw new Error('SITE_URL is not set (e.g. https://butakov.dev)');
  return env.SITE_URL.replace(/\/+$/, '');
}

/**
 * Same precedence as src/config/workshopEnv.ts: the hosting panel injects DB_CONNECTION_STRING.
 * @param {Record<string, string | undefined>} [env]
 */
export function readDatabaseUrl(env = process.env) {
  const url = env.DATABASE_URL || env.DB_CONNECTION_STRING;
  if (!url) throw new Error('DATABASE_URL (or DB_CONNECTION_STRING) is not set');
  return url;
}

export const WEBHOOK_PATH = '/api/workshop/tg';

/**
 * @param {Record<string, string | undefined>} env
 * @param {{ remove: boolean }} opts
 */
export function buildWebhookRequest(env, { remove }) {
  if (remove) return { method: 'deleteWebhook', body: { drop_pending_updates: true } };
  if (!env.TELEGRAM_WEBHOOK_SECRET) throw new Error('TELEGRAM_WEBHOOK_SECRET is not set');
  return {
    method: 'setWebhook',
    body: {
      url: `${readSiteUrl(env)}${WEBHOOK_PATH}`,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
      // One request at a time: a double tap must not run a confirm twice in parallel.
      max_connections: 1,
    },
  };
}

/** @param {string} [url] */
export function connect(url = readDatabaseUrl()) {
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
 * Retention, spec §9: a participant is kept while the latest portfolio or the latest quote
 * consent is granted and younger than 36 months (a revoked consent counts as none);
 * otherwise they are deleted 12 months after their last session.
 * @param {import('postgres').Sql} sql
 * @param {{ dryRun: boolean, now?: Date }} opts
 * @returns {Promise<number[]>}
 */
export async function purgeParticipants(sql, { dryRun, now = new Date() }) {
  // Selecting inside the transaction: a participant who registers between the SELECT and
  // the DELETEs must not be purged on a stale verdict.
  return sql.begin(async (tx) => {
    const due = await tx`
      WITH latest_consent AS (
        SELECT DISTINCT ON (participant_id, kind) participant_id, granted, created_at
        FROM workshop_consents WHERE kind IN ('portfolio', 'quote')
        ORDER BY participant_id, kind, id DESC
      ), consent_hold AS (
        SELECT participant_id,
               bool_or(granted AND created_at >= ${now}::timestamptz - interval '36 months') AS held
        FROM latest_consent GROUP BY participant_id
      ), last_session AS (
        SELECT r.participant_id, max(s.ends_at) AS last_end
        FROM workshop_registrations r JOIN workshop_sessions s ON s.id = r.session_id
        GROUP BY r.participant_id
      )
      SELECT p.id FROM workshop_participants p
      LEFT JOIN last_session ls ON ls.participant_id = p.id
      LEFT JOIN consent_hold ch ON ch.participant_id = p.id
      WHERE (ls.last_end IS NULL OR ls.last_end < ${now}::timestamptz - interval '12 months')
        AND ch.held IS NOT TRUE`;
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
