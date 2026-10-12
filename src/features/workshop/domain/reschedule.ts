import {
  EMAIL_JOB_STATUS,
  EMAIL_OFFSETS_MIN,
  MINUTE_MS,
  type EmailJobStatus,
} from '@/config/workshop';
import { followupSendAt, type EmailKind } from './emailPlan';

export interface JobRow {
  id: number;
  kind: EmailKind;
  status: EmailJobStatus;
}
export interface JobChange {
  id: number;
  sendAt: Date;
  status: 'pending' | 'cancelled';
}

const REMINDER_OFFSET_MIN: Partial<Record<EmailKind, number>> = {
  reminder_24h: EMAIL_OFFSETS_MIN.reminder24h,
  reminder_1h: EMAIL_OFFSETS_MIN.reminder1h,
};

export function rescheduleJobs(
  jobs: JobRow[],
  session: { startsAt: Date; endsAt: Date },
  now: Date
): JobChange[] {
  const out: JobChange[] = [];
  for (const job of jobs) {
    const offset = REMINDER_OFFSET_MIN[job.kind];
    if (offset !== undefined) {
      // A cancelled reminder may come back: moving the session later makes its moment future again.
      if (job.status !== EMAIL_JOB_STATUS.pending && job.status !== EMAIL_JOB_STATUS.cancelled)
        continue;
      const sendAt = new Date(session.startsAt.getTime() - offset * MINUTE_MS);
      out.push({ id: job.id, sendAt, status: sendAt > now ? 'pending' : 'cancelled' });
      continue;
    }
    if (job.status !== EMAIL_JOB_STATUS.pending) continue;
    if (job.kind === 'post_session') {
      out.push({
        id: job.id,
        sendAt: new Date(session.endsAt.getTime() + EMAIL_OFFSETS_MIN.postSession * MINUTE_MS),
        status: 'pending',
      });
    } else if (job.kind === 'followup') {
      out.push({ id: job.id, sendAt: followupSendAt(session.endsAt), status: 'pending' });
    }
  }
  return out;
}
