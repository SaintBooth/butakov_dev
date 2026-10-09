import type { Sql, TransactionSql } from 'postgres';
import { EMAIL_JOB_STATUS, type RegistrationStatus } from '@/config/workshop';
import type { EmailKind, PlannedEmail } from '../domain/emailPlan';

export async function enqueueEmails(
  db: Sql | TransactionSql,
  registrationId: number,
  plan: PlannedEmail[]
): Promise<void> {
  if (plan.length === 0) return;
  const rows = plan.map((e) => ({ registrationId, kind: e.kind, sendAt: e.sendAt }));
  // A repeat registration re-sends the confirmation and revives jobs a cancellation stopped.
  await db`
    INSERT INTO workshop_email_jobs ${db(rows, 'registrationId', 'kind', 'sendAt')}
    ON CONFLICT (registration_id, kind) DO UPDATE
      SET status = ${EMAIL_JOB_STATUS.pending}, send_at = EXCLUDED.send_at,
          attempts = 0, last_error = NULL
      WHERE workshop_email_jobs.kind = 'confirmation'
         OR workshop_email_jobs.status = ${EMAIL_JOB_STATUS.cancelled}`;
}

export async function cancelPendingEmails(
  db: Sql | TransactionSql,
  registrationId: number
): Promise<void> {
  await db`
    UPDATE workshop_email_jobs SET status = ${EMAIL_JOB_STATUS.cancelled}
    WHERE registration_id = ${registrationId} AND status = ${EMAIL_JOB_STATUS.pending}`;
}

export interface DueJob {
  id: number;
  kind: EmailKind;
  attempts: number;
  registrationId: number;
  registrationStatus: RegistrationStatus;
  participantId: number;
  email: string;
  fullName: string;
  slug: string;
  sessionTitle: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string;
  materialsUrl: string | null;
}

export async function claimDueJobs(
  db: Sql | TransactionSql,
  now: Date,
  limit: number
): Promise<DueJob[]> {
  return db<DueJob[]>`
    SELECT j.id, j.kind, j.attempts,
           r.id AS registration_id, r.status AS registration_status,
           p.id AS participant_id, p.email, p.full_name,
           s.slug, s.title AS session_title, s.starts_at, s.ends_at, s.meeting_url, s.materials_url
    FROM workshop_email_jobs j
    JOIN workshop_registrations r ON r.id = j.registration_id
    JOIN workshop_participants p ON p.id = r.participant_id
    JOIN workshop_sessions s ON s.id = r.session_id
    WHERE j.status = ${EMAIL_JOB_STATUS.pending} AND j.send_at <= ${now}
    ORDER BY j.send_at
    LIMIT ${limit}
    FOR UPDATE OF j SKIP LOCKED`;
}

export async function markSent(db: Sql | TransactionSql, id: number, now: Date): Promise<void> {
  await db`
    UPDATE workshop_email_jobs
    SET status = ${EMAIL_JOB_STATUS.sent}, sent_at = ${now}, last_error = NULL
    WHERE id = ${id}`;
}

export async function markRetry(
  db: Sql | TransactionSql,
  id: number,
  attempts: number,
  nextAt: Date | null,
  error: string
): Promise<void> {
  await db`
    UPDATE workshop_email_jobs
    SET attempts = ${attempts}, last_error = ${error},
        status = ${nextAt ? EMAIL_JOB_STATUS.pending : EMAIL_JOB_STATUS.failed},
        send_at = COALESCE(${nextAt}::timestamptz, send_at)
    WHERE id = ${id}`;
}

export async function markCancelled(db: Sql | TransactionSql, id: number): Promise<void> {
  await db`UPDATE workshop_email_jobs SET status = ${EMAIL_JOB_STATUS.cancelled} WHERE id = ${id}`;
}
