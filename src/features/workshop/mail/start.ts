import { MAILER } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { describeError } from '../server/describeError';
import { notifyOwner } from '../server/notify';
import { createSmtpSender } from './transport';
import { runMailerTick } from './worker';
import { runSummaryTick } from '../bot/summary';

// On globalThis so that dev hot reloads, which re-evaluate this module, cannot start a second interval.
const globals = globalThis as typeof globalThis & { __workshopMailerStarted?: boolean };

export function startMailer(): void {
  if (globals.__workshopMailerStarted) return;
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db || !env.WORKSHOP_MAILER_ENABLED) return;
  globals.__workshopMailerStarted = true;

  const deps = {
    db,
    send: createSmtpSender(env),
    now: () => new Date(),
    notify: (text: string) => notifyOwner(env, text),
  };
  let running = false;
  const timer = setInterval(() => {
    // A slow SMTP server must not stack ticks on top of each other.
    if (running) return;
    running = true;
    runMailerTick(deps)
      // The summary is claimed before it is sent, so without a target it would be lost.
      .then(() =>
        env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID
          ? runSummaryTick({ db, now: deps.now, notify: deps.notify })
          : undefined
      )
      // Error messages from the driver can carry row data, so only the class and code are logged.
      .catch((err) => console.error('[workshop] mailer tick failed:', describeError(err)))
      .finally(() => {
        running = false;
      });
  }, MAILER.tickMs);
  timer.unref();
}
