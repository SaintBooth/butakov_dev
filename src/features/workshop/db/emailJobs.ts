import type { Sql, TransactionSql } from 'postgres';
import type { EmailKind, PlannedEmail, RegistrationStatus } from '../domain/emailPlan';

export async function enqueueEmails(
  db: Sql | TransactionSql,
  registrationId: number,
  plan: PlannedEmail[]
): Promise<void> {
  for (const e of plan) {
    // A repeat registration re-sends the confirmation and revives jobs a cancellation stopped.
    await db`
      INSERT INTO workshop_email_jobs (registration_id, kind, send_at)
      VALUES (${registrationId}, ${e.kind}, ${e.sendAt})
      ON CONFLICT (registration_id, kind) DO UPDATE
        SET status = 'pending', send_at = EXCLUDED.send_at, attempts = 0, last_error = NULL
        WHERE workshop_email_jobs.kind = 'confirmation' OR workshop_email_jobs.status = 'cancelled'`;
  }
}

export async function cancelPendingEmails(
  db: Sql | TransactionSql,
  registrationId: number
): Promise<void> {
  await db`
    UPDATE workshop_email_jobs SET status = 'cancelled'
    WHERE registration_id = ${registrationId} AND status = 'pending'`;
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
    WHERE j.status = 'pending' AND j.send_at <= ${now}
    ORDER BY j.send_at
    LIMIT ${limit}
    FOR UPDATE OF j SKIP LOCKED`;
}

export async function markSent(db: Sql | TransactionSql, id: number, now: Date): Promise<void> {
  await db`UPDATE workshop_email_jobs SET status = 'sent', sent_at = ${now}, last_error = NULL WHERE id = ${id}`;
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
        status = ${nextAt ? 'pending' : 'failed'},
        send_at = COALESCE(${nextAt}::timestamptz, send_at)
    WHERE id = ${id}`;
}

export async function markCancelled(db: Sql | TransactionSql, id: number): Promise<void> {
  await db`UPDATE workshop_email_jobs SET status = 'cancelled' WHERE id = ${id}`;
}
