import { createTranslator } from 'next-intl';
import type { Sql, TransactionSql } from 'postgres';
import messages from '../../../../messages/ru.json';
import { absoluteUrl, MAILER, WORKSHOP_LOCALE, WORKSHOP_PATHS } from '@/config/workshop';
import { listConsentEvents } from '../db/consents';
import { claimDueJobs, markCancelled, markRetry, markSent, type DueJob } from '../db/emailJobs';
import { issueToken } from '../db/tokens';
import { currentConsents } from '../domain/consents';
import { nextRetryAt, resolveJob, type TemplateId } from '../domain/emailPlan';
import type { TokenPurpose } from '../domain/tokens';
import { composeEmail, type OutgoingMail } from './compose';

export interface MailerDeps {
  db: Sql;
  send: (mail: OutgoingMail) => Promise<void>;
  now: () => Date;
  notify: (text: string) => Promise<void>;
}

const t = createTranslator({ locale: WORKSHOP_LOCALE, messages, namespace: 'workshop.notify' });

// Provider messages quote the recipient address, so only the error class and codes are stored.
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return 'UnknownError';
  const { code, responseCode } = err as Error & { code?: unknown; responseCode?: unknown };
  return [err.name, code, responseCode]
    .filter((p): p is string | number => typeof p === 'string' || typeof p === 'number')
    .join(':');
}

async function issueLinks(db: Sql | TransactionSql, job: DueJob, template: TemplateId, now: Date) {
  const link = async (purpose: TokenPurpose, path: (token: string) => string) =>
    absoluteUrl(path(await issueToken(db, job.registrationId, purpose, job.endsAt, now)));
  return {
    manage: await link('manage', WORKSHOP_PATHS.manage),
    feedback:
      template === 'post_attended' ? await link('feedback', WORKSHOP_PATHS.feedback) : undefined,
    followup: template === 'followup' ? await link('followup', WORKSHOP_PATHS.followup) : undefined,
  };
}

type TickStats = { sent: number; cancelled: number; failed: number };
type JobOutcome = { jobId: number; exhausted: boolean };

// One short transaction per job: a failure or a slow SMTP call only holds that job's row lock,
// and mails already sent stay marked as sent.
async function processNextJob(deps: MailerDeps, stats: TickStats): Promise<JobOutcome | null> {
  return deps.db.begin(async (tx) => {
    const now = deps.now();
    const [job] = await claimDueJobs(tx, now, 1);
    if (!job) return null;
    const consents = currentConsents(await listConsentEvents(tx, job.participantId));
    const decision = resolveJob(job.kind, job.registrationStatus, consents.marketing);
    if (decision.action === 'cancel') {
      await markCancelled(tx, job.id);
      stats.cancelled++;
      return { jobId: job.id, exhausted: false };
    }
    // Compose and link issuing are inside the try: a poison job must retry, not block the queue.
    // SQL failures in the marks below still abort the tick.
    try {
      const mail = composeEmail({
        template: decision.template,
        includeAnnouncement: decision.includeAnnouncement,
        to: job.email,
        fullName: job.fullName,
        slug: job.slug,
        sessionTitle: job.sessionTitle,
        startsAt: job.startsAt,
        endsAt: job.endsAt,
        meetingUrl: job.meetingUrl,
        materialsUrl: job.materialsUrl,
        links: await issueLinks(tx, job, decision.template, now),
        now,
      });
      await deps.send(mail);
    } catch (err) {
      const attempts = job.attempts + 1;
      const nextAt = nextRetryAt(attempts, now);
      await markRetry(tx, job.id, attempts, nextAt, describeError(err));
      if (!nextAt) stats.failed++;
      return { jobId: job.id, exhausted: !nextAt };
    }
    await markSent(tx, job.id, now);
    stats.sent++;
    return { jobId: job.id, exhausted: false };
  });
}

export async function runMailerTick(deps: MailerDeps): Promise<TickStats> {
  const stats = { sent: 0, cancelled: 0, failed: 0 };
  for (let i = 0; i < MAILER.batchSize; i++) {
    const outcome = await processNextJob(deps, stats);
    if (!outcome) break;
    if (outcome.exhausted) await deps.notify(t('mailFailed', { jobId: outcome.jobId }));
  }
  return stats;
}
