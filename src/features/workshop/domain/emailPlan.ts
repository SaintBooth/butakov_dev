import { EMAIL_OFFSETS_MIN, FOLLOWUP_AFTER_END_DAYS, MAILER } from '@/config/workshop';

export type EmailKind =
  | 'confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'post_session'
  | 'followup';
export type TemplateId =
  | 'confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'post_attended'
  | 'post_missed'
  | 'followup';
export type RegistrationStatus = 'registered' | 'attended' | 'cancelled';

export interface PlannedEmail {
  kind: EmailKind;
  sendAt: Date;
}

export type JobDecision =
  | { action: 'cancel' }
  | { action: 'send'; template: TemplateId; includeAnnouncement: boolean };

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export function planRegistrationEmails(
  session: { startsAt: Date; endsAt: Date },
  now: Date
): PlannedEmail[] {
  const start = session.startsAt.getTime();
  const reminders: PlannedEmail[] = [
    { kind: 'reminder_24h', sendAt: new Date(start - EMAIL_OFFSETS_MIN.reminder24h * MINUTE_MS) },
    { kind: 'reminder_1h', sendAt: new Date(start - EMAIL_OFFSETS_MIN.reminder1h * MINUTE_MS) },
  ];
  return [
    { kind: 'confirmation', sendAt: now },
    // A late registrant gets no reminder for a moment that has already passed.
    ...reminders.filter((r) => r.sendAt.getTime() > now.getTime()),
    {
      kind: 'post_session',
      sendAt: new Date(session.endsAt.getTime() + EMAIL_OFFSETS_MIN.postSession * MINUTE_MS),
    },
  ];
}

export function followupSendAt(endsAt: Date): Date {
  return new Date(endsAt.getTime() + FOLLOWUP_AFTER_END_DAYS * DAY_MS);
}

export function nextRetryAt(attempts: number, now: Date): Date | null {
  const delay = MAILER.retryDelaysMin[attempts - 1];
  return delay === undefined ? null : new Date(now.getTime() + delay * MINUTE_MS);
}

export function resolveJob(
  kind: EmailKind,
  status: RegistrationStatus,
  marketingConsent: boolean
): JobDecision {
  if (status === 'cancelled') return { action: 'cancel' };
  if (kind === 'post_session') {
    return status === 'attended'
      ? { action: 'send', template: 'post_attended', includeAnnouncement: false }
      : { action: 'send', template: 'post_missed', includeAnnouncement: marketingConsent };
  }
  if (kind === 'followup' && status !== 'attended') return { action: 'cancel' };
  return { action: 'send', template: kind, includeAnnouncement: false };
}
