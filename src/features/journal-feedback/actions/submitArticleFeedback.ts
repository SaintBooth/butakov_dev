'use server';

import { headers } from 'next/headers';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '@/features/workshop/db/client';
import { guardDb } from '@/features/workshop/server/actionGuard';
import { getClientIp } from '@/features/workshop/server/clientIp';
import { notifyOwner } from '@/features/workshop/server/notify';
import { createRateLimiter } from '@/features/workshop/server/rateLimit';
import type { Locale } from '@/i18n/locales';
import { getCaseSlugs } from '@/utils/cases';
import { upsertFeedback } from '../db/feedback';
import { formatFeedbackNotice } from '../domain/feedbackNotice';
import { createFeedbackInputSchema, type FeedbackResult } from '../domain/feedbackSchema';
import { rateLimitKey } from '../domain/rateLimitKey';
import { voterHash } from '../domain/voterHash';

const votes = createRateLimiter(JOURNAL_FEEDBACK.rateLimit.votes);
const comments = createRateLimiter(JOURNAL_FEEDBACK.rateLimit.comments);
const notifications = createRateLimiter(JOURNAL_FEEDBACK.rateLimit.notifications);
const SITE_WIDE = 'global';

// Articles only change with a deploy, which restarts the process; no need to hit the disk per vote.
const slugCache = new Map<Locale, string[]>();
function slugsFor(locale: Locale): string[] {
  let slugs = slugCache.get(locale);
  if (!slugs) slugCache.set(locale, (slugs = getCaseSlugs(locale)));
  return slugs;
}
const inputSchema = createFeedbackInputSchema(slugsFor);

const SERVER_ERROR: FeedbackResult = { ok: false, reason: 'server' };
const RATE_LIMITED: FeedbackResult = { ok: false, reason: 'rate_limited' };

export async function submitArticleFeedback(raw: unknown): Promise<FeedbackResult> {
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db) return SERVER_ERROR;

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: 'invalid' };
  const input = parsed.data;

  const key = rateLimitKey(getClientIp(await headers(), env.WORKSHOP_IP_HEADER));
  const spent = input.comment ? [votes, comments] : [votes];
  if (key) {
    if (spent.some((limiter) => limiter.isLimited(key))) return RATE_LIMITED;
    // Hit before the database round trip: check-then-hit across an await lets a burst slip through.
    spent.forEach((limiter) => limiter.hit(key));
  }

  return guardDb(
    'journal feedback',
    () => {
      if (key) spent.forEach((limiter) => limiter.refund(key));
      return SERVER_ERROR;
    },
    async () => {
      await upsertFeedback(db, {
        slug: input.slug,
        locale: input.locale,
        helpful: input.helpful,
        comment: input.comment,
        voterHash: voterHash(env.WORKSHOP_FORM_SECRET, input.voterId),
      });
      // Past the site-wide ceiling the comment is still stored, just not pushed to the owner.
      if (input.comment && !notifications.isLimited(SITE_WIDE)) {
        notifications.hit(SITE_WIDE);
        await notifyOwner(env, formatFeedbackNotice({ ...input, comment: input.comment }));
      }
      return { ok: true } as const;
    }
  );
}
