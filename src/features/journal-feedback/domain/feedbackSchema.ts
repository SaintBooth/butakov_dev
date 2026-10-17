import { z } from 'zod';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import { LOCALES, type Locale } from '@/i18n/locales';
import { isVoterId } from './voterId';

export function createFeedbackInputSchema(slugsFor: (locale: Locale) => readonly string[]) {
  return z
    .strictObject({
      slug: z.string().min(1).max(200),
      locale: z.enum(LOCALES),
      helpful: z.boolean(),
      voterId: z.string().refine(isVoterId),
      comment: z
        .string()
        .trim()
        .max(JOURNAL_FEEDBACK.commentMaxLength)
        .optional()
        .transform((v) => v || undefined),
    })
    .superRefine((v, ctx) => {
      if (!slugsFor(v.locale).includes(v.slug)) {
        ctx.addIssue({ code: 'custom', path: ['slug'], message: 'unknown article' });
      }
      if (v.helpful && v.comment) {
        ctx.addIssue({ code: 'custom', path: ['comment'], message: 'comment only on "no"' });
      }
    });
}

export type FeedbackInput = z.output<ReturnType<typeof createFeedbackInputSchema>>;

export const feedbackResultSchema = z.discriminatedUnion('ok', [
  z.strictObject({ ok: z.literal(true) }),
  z.strictObject({ ok: z.literal(false), reason: z.enum(['rate_limited', 'invalid', 'server']) }),
]);

export type FeedbackResult = z.infer<typeof feedbackResultSchema>;
