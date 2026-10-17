import type { Sql } from 'postgres';
import type { Locale } from '@/i18n/locales';

export interface FeedbackVote {
  slug: string;
  locale: Locale;
  helpful: boolean;
  comment?: string | null;
  voterHash: string;
}

// A "no" sent on click carries no text; it must not wipe a comment the reader sent around it.
// Flipping to "yes" drops the comment, since it no longer describes the reader's answer.
export async function upsertFeedback(sql: Sql, vote: FeedbackVote): Promise<void> {
  await sql`
    INSERT INTO article_feedback (slug, locale, helpful, comment, voter_hash)
    VALUES (${vote.slug}, ${vote.locale}, ${vote.helpful}, ${vote.comment ?? null}, ${vote.voterHash})
    ON CONFLICT (slug, voter_hash) DO UPDATE SET
      helpful    = EXCLUDED.helpful,
      locale     = EXCLUDED.locale,
      comment    = CASE WHEN EXCLUDED.helpful THEN NULL
                        ELSE COALESCE(EXCLUDED.comment, article_feedback.comment) END,
      updated_at = now()`;
}
