import { MAILER } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { notifyOwner } from '../server/notify';
import { createSmtpSender } from './transport';
import { runMailerTick } from './worker';

let started = false;

export function startMailer(): void {
  if (started) return;
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db || env.WORKSHOP_MAILER_ENABLED !== 'true') return;
  started = true;

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
      .catch((err) =>
        console.error(
          '[workshop] mailer tick failed:',
          err instanceof Error ? err.message : 'unknown'
        )
      )
      .finally(() => {
        running = false;
      });
  }, MAILER.tickMs);
  timer.unref();
}
