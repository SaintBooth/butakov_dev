import type { Sql } from 'postgres';
import { EMAIL_JOB_STATUS, REGISTRATION_STATUS } from '@/config/workshop';
import { rescheduleJobs, type JobRow } from '../domain/reschedule';

export type RescheduleResult =
  | { status: 'ok'; notified: number }
  | { status: 'started' }
  | { status: 'not_found' };

export async function rescheduleSession(
  db: Sql,
  id: number,
  startsAt: Date,
  endsAt: Date,
  now: Date
): Promise<RescheduleResult> {
  return db.begin(async (tx): Promise<RescheduleResult> => {
    // The row lock keeps a concurrent registration from planning letters against the old time.
    const [s] = await tx<{ startsAt: Date }[]>`
      SELECT starts_at FROM workshop_sessions WHERE id = ${id} FOR UPDATE`;
    if (!s) return { status: 'not_found' };
    if (s.startsAt <= now) return { status: 'started' };
    await tx`UPDATE workshop_sessions SET starts_at = ${startsAt}, ends_at = ${endsAt} WHERE id = ${id}`;

    const regs = await tx<{ id: number }[]>`
      SELECT id FROM workshop_registrations
      WHERE session_id = ${id} AND status <> ${REGISTRATION_STATUS.cancelled}`;
    const regIds = regs.map((r) => r.id);
    if (regIds.length === 0) return { status: 'ok', notified: 0 };

    const jobs = await tx<JobRow[]>`
      SELECT id, kind, status FROM workshop_email_jobs WHERE registration_id = ANY(${regIds})`;
    for (const c of rescheduleJobs(jobs, { startsAt, endsAt }, now)) {
      await tx`UPDATE workshop_email_jobs SET send_at = ${c.sendAt}, status = ${c.status} WHERE id = ${c.id}`;
    }
    const notices = regIds.map((registrationId) => ({
      registrationId,
      kind: 'rescheduled',
      sendAt: now,
    }));
    await tx`
      INSERT INTO workshop_email_jobs ${tx(notices, 'registrationId', 'kind', 'sendAt')}
      ON CONFLICT (registration_id, kind) DO UPDATE
        SET status = ${EMAIL_JOB_STATUS.pending}, send_at = EXCLUDED.send_at,
            attempts = 0, last_error = NULL`;
    return { status: 'ok', notified: regIds.length };
  });
}
