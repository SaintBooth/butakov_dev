import type { Sql, TransactionSql } from 'postgres';
import type { PlannedEmail } from '../domain/emailPlan';

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
