import type { Sql, TransactionSql } from 'postgres';

export async function countActiveRegistrations(
  db: Sql | TransactionSql,
  sessionId: number
): Promise<number> {
  const [row] = await db<{ n: number }[]>`
    SELECT count(*)::int AS n FROM workshop_registrations
    WHERE session_id = ${sessionId} AND status <> 'cancelled'`;
  return row.n;
}

export async function markAttended(
  db: Sql | TransactionSql,
  sessionId: number,
  email: string,
  now: Date
): Promise<number | null> {
  const [row] = await db<{ id: number }[]>`
    UPDATE workshop_registrations r
    SET status = 'attended', attended_at = COALESCE(r.attended_at, ${now}), updated_at = ${now}
    FROM workshop_participants p
    WHERE r.participant_id = p.id AND p.email = ${email} AND r.session_id = ${sessionId}
    RETURNING r.id`;
  return row?.id ?? null;
}

export async function cancelRegistration(
  db: Sql | TransactionSql,
  registrationId: number
): Promise<void> {
  await db`
    UPDATE workshop_registrations SET status = 'cancelled', updated_at = now()
    WHERE id = ${registrationId} AND status = 'registered'`;
}
