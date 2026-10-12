import type { Sql, TransactionSql } from 'postgres';
import { EMAIL_JOB_STATUS, REGISTRATION_STATUS } from '@/config/workshop';
import { generateCheckinCode } from '../domain/checkin';

const UNIQUE_VIOLATION = '23505';
const MAX_SLUG_ATTEMPTS = 20;

export interface WorkshopSession {
  id: number;
  slug: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string;
  materialsUrl: string | null;
  checkinCode: string;
  capacity: number;
  registrationOpen: boolean;
}

export interface SessionListItem extends WorkshopSession {
  registered: number;
}

export interface SessionCounts {
  registered: number;
  cancelled: number;
  attended: number;
}

export interface SessionSummary extends SessionCounts {
  feedbackCount: number;
  avgRecommend: number | null;
  followupsSent: number;
  followupsAnswered: number;
}

export interface NewSession {
  title: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string;
  capacity: number;
}

export type SessionPatch = Partial<
  Pick<WorkshopSession, 'title' | 'meetingUrl' | 'materialsUrl' | 'capacity' | 'registrationOpen'>
>;

type Db = Sql | TransactionSql;

export async function findSessionBySlug(
  db: Sql | TransactionSql,
  slug: string
): Promise<WorkshopSession | null> {
  const [row] = await db<WorkshopSession[]>`
    SELECT id, slug, title, starts_at, ends_at, meeting_url, materials_url,
           checkin_code, capacity, registration_open
    FROM workshop_sessions WHERE slug = ${slug}`;
  return row ?? null;
}

export async function findSessionById(db: Db, id: number): Promise<WorkshopSession | null> {
  const [row] = await db<WorkshopSession[]>`
    SELECT id, slug, title, starts_at, ends_at, meeting_url, materials_url,
           checkin_code, capacity, registration_open
    FROM workshop_sessions WHERE id = ${id}`;
  return row ?? null;
}

export function listUpcomingSessions(db: Db, now: Date) {
  return db<SessionListItem[]>`
    SELECT s.id, s.slug, s.title, s.starts_at, s.ends_at, s.meeting_url, s.materials_url,
           s.checkin_code, s.capacity, s.registration_open,
           count(r.id) FILTER (WHERE r.status <> ${REGISTRATION_STATUS.cancelled})::int AS registered
    FROM workshop_sessions s LEFT JOIN workshop_registrations r ON r.session_id = s.id
    WHERE s.ends_at >= ${now}
    GROUP BY s.id ORDER BY s.starts_at`;
}

export function listPastSessions(db: Db, now: Date, limit: number) {
  return db<SessionListItem[]>`
    SELECT s.id, s.slug, s.title, s.starts_at, s.ends_at, s.meeting_url, s.materials_url,
           s.checkin_code, s.capacity, s.registration_open,
           count(r.id) FILTER (WHERE r.status <> ${REGISTRATION_STATUS.cancelled})::int AS registered
    FROM workshop_sessions s LEFT JOIN workshop_registrations r ON r.session_id = s.id
    WHERE s.ends_at < ${now}
    GROUP BY s.id ORDER BY s.starts_at DESC LIMIT ${limit}`;
}

// Not for use inside db.begin: a unique violation would abort the surrounding transaction.
export async function createSession(
  db: Sql,
  s: NewSession,
  slugBase: string
): Promise<WorkshopSession> {
  for (let n = 1; n <= MAX_SLUG_ATTEMPTS; n++) {
    const row = {
      ...s,
      slug: n === 1 ? slugBase : `${slugBase}-${n}`,
      checkinCode: generateCheckinCode(),
    };
    try {
      const [created] = await db<WorkshopSession[]>`
        INSERT INTO workshop_sessions ${db(row)}
        RETURNING id, slug, title, starts_at, ends_at, meeting_url, materials_url,
                  checkin_code, capacity, registration_open`;
      return created;
    } catch (err) {
      if ((err as { code?: string }).code !== UNIQUE_VIOLATION) throw err;
    }
  }
  throw new Error('no free slug');
}

export async function updateSession(db: Db, id: number, patch: SessionPatch): Promise<void> {
  const keys = Object.keys(patch) as (keyof SessionPatch)[];
  if (keys.length === 0) return;
  await db`UPDATE workshop_sessions SET ${db(patch, ...keys)} WHERE id = ${id}`;
}

export async function sessionCounts(db: Db, id: number): Promise<SessionCounts> {
  const [row] = await db<SessionCounts[]>`
    SELECT count(*) FILTER (WHERE status <> ${REGISTRATION_STATUS.cancelled})::int AS registered,
           count(*) FILTER (WHERE status = ${REGISTRATION_STATUS.cancelled})::int AS cancelled,
           count(*) FILTER (WHERE status = ${REGISTRATION_STATUS.attended})::int AS attended
    FROM workshop_registrations WHERE session_id = ${id}`;
  return row;
}

export async function sessionSummary(db: Db, id: number): Promise<SessionSummary> {
  const counts = await sessionCounts(db, id);
  const [row] = await db<Omit<SessionSummary, keyof SessionCounts>[]>`
    SELECT count(f.registration_id)::int AS feedback_count,
           round(avg(f.recommend_score), 1)::float AS avg_recommend,
           count(j.id) FILTER (WHERE j.status = ${EMAIL_JOB_STATUS.sent})::int AS followups_sent,
           count(fu.registration_id)::int AS followups_answered
    FROM workshop_registrations r
    LEFT JOIN workshop_feedback f ON f.registration_id = r.id
    LEFT JOIN workshop_email_jobs j ON j.registration_id = r.id AND j.kind = 'followup'
    LEFT JOIN workshop_followups fu ON fu.registration_id = r.id
    WHERE r.session_id = ${id}`;
  return { ...counts, ...row };
}
