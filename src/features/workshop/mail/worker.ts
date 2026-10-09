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
const MAX_ERROR_LENGTH = 500;

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

export async function runMailerTick(
  deps: MailerDeps
): Promise<{ sent: number; cancelled: number; failed: number }> {
  const stats = { sent: 0, cancelled: 0, failed: 0 };
  const failedJobs: number[] = [];
  await deps.db.begin(async (tx) => {
    const now = deps.now();
    for (const job of await claimDueJobs(tx, now, MAILER.batchSize)) {
      const consents = currentConsents(await listConsentEvents(tx, job.participantId));
      const decision = resolveJob(job.kind, job.registrationStatus, consents.marketing);
      if (decision.action === 'cancel') {
        await markCancelled(tx, job.id);
        stats.cancelled++;
        continue;
      }
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
      // Only the SMTP call is caught: a SQL error must abort the tick, not poison the transaction.
      try {
        await deps.send(mail);
      } catch (err) {
        const attempts = job.attempts + 1;
        const nextAt = nextRetryAt(attempts, now);
        const message = (err instanceof Error ? err.message : String(err)).slice(
          0,
          MAX_ERROR_LENGTH
        );
        await markRetry(tx, job.id, attempts, nextAt, message);
        if (!nextAt) {
          stats.failed++;
          failedJobs.push(job.id);
        }
        continue;
      }
      await markSent(tx, job.id, now);
      stats.sent++;
    }
  });
  for (const jobId of failedJobs) await deps.notify(t('mailFailed', { jobId }));
  return stats;
}
