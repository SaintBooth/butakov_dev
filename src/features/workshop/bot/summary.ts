import type { Sql } from 'postgres';
import { BOT, WORKSHOP_TIME_ZONE } from '@/config/workshop';
import { findSessionById, sessionSummary } from '../db/sessions';
import { describeError } from '../server/describeError';
import { summaryView } from './views';

export interface SummaryDeps {
  db: Sql;
  now: () => Date;
  notify: (text: string) => Promise<void>;
}

export async function runSummaryTick(deps: SummaryDeps): Promise<number> {
  const now = deps.now();
  // Claim before sending: two overlapping ticks must not both send.
  const due = await deps.db<{ id: number }[]>`
    UPDATE workshop_sessions SET summary_sent_at = ${now}
    WHERE summary_sent_at IS NULL
      AND ends_at > ${now}::timestamptz - make_interval(days => ${BOT.summaryMaxAgeDays})
      AND ${now}::timestamptz >= (((ends_at AT TIME ZONE ${WORKSHOP_TIME_ZONE})::date + 1)
            + make_interval(hours => ${BOT.summaryHour})) AT TIME ZONE ${WORKSHOP_TIME_ZONE}
    RETURNING id`;
  for (const { id } of due) {
    // Already claimed, so one failed send must not stop the rest (and is not retried).
    try {
      const s = await findSessionById(deps.db, id);
      if (s) await deps.notify(summaryView(s, await sessionSummary(deps.db, id)).text);
    } catch (err) {
      console.error('[workshop-bot] summary failed:', describeError(err));
    }
  }
  return due.length;
}
