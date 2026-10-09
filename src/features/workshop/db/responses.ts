import type { Sql, TransactionSql } from 'postgres';
import type { FeedbackInput, FollowupInput } from '../schema';

export async function insertFeedback(
  db: Sql | TransactionSql,
  registrationId: number,
  f: FeedbackInput
): Promise<boolean> {
  const rows = await db`
    INSERT INTO workshop_feedback (
      registration_id, recommend_score, applicability, most_useful, plan_to_implement,
      testimonial, wants_review, followup_ok
    ) VALUES (
      ${registrationId}, ${f.recommendScore}, ${f.applicability}, ${f.mostUseful ?? null},
      ${f.planToImplement ?? null}, ${f.testimonial ?? null}, ${f.wantsReview}, ${f.followupOk}
    )
    ON CONFLICT (registration_id) DO NOTHING
    RETURNING registration_id`;
  return rows.length > 0;
}

export async function insertFollowup(
  db: Sql | TransactionSql,
  registrationId: number,
  f: FollowupInput
): Promise<boolean> {
  const rows = await db`
    INSERT INTO workshop_followups (registration_id, implemented, result, letter_ok)
    VALUES (${registrationId}, ${f.implemented ?? null}, ${f.result ?? null}, ${f.letterOk})
    ON CONFLICT (registration_id) DO NOTHING
    RETURNING registration_id`;
  return rows.length > 0;
}

export async function hasResponse(
  db: Sql | TransactionSql,
  registrationId: number,
  kind: 'feedback' | 'followup'
): Promise<boolean> {
  // Table names cannot be bound parameters, hence one query per kind.
  const [row] =
    kind === 'feedback'
      ? await db`SELECT 1 AS found FROM workshop_feedback WHERE registration_id = ${registrationId}`
      : await db`SELECT 1 AS found FROM workshop_followups WHERE registration_id = ${registrationId}`;
  return Boolean(row);
}
