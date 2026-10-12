import { BOT } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { describeError } from '../server/describeError';
import { createWorkshopBot } from './bot';

// On globalThis so that dev hot reloads, which re-evaluate this module, cannot start a second poller.
const globals = globalThis as typeof globalThis & { __workshopBotPollingStarted?: boolean };

const STOP_SIGNALS = ['SIGTERM', 'SIGINT'] as const;

type SupervisorDeps = {
  start: () => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  log: (message: string) => void;
  delays: readonly number[];
  healthyMs: number;
  now: () => number;
  isStopped: () => boolean;
};

// grammY's start() retries network errors itself but rejects on 401 and 409 (another process is
// still polling, e.g. the old one during a deploy), so a rejection is retried with backoff.
export async function runPollingSupervisor(deps: SupervisorDeps): Promise<void> {
  const { start, sleep, log, delays, healthyMs, now, isStopped } = deps;
  let attempt = 0;
  while (!isStopped()) {
    const startedAt = now();
    try {
      await start();
    } catch (err) {
      // Only the class and code: API errors can echo request details.
      log(`polling stopped: ${describeError(err)}`);
    }
    if (isStopped()) return;
    if (now() - startedAt >= healthyMs) attempt = 0;
    await sleep(delays[Math.min(attempt, delays.length - 1)]);
    attempt += 1;
  }
}

export function startBotPolling(): void {
  if (globals.__workshopBotPollingStarted) return;
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db || env.TELEGRAM_BOT_MODE !== 'polling' || !env.TELEGRAM_BOT_TOKEN) return;
  const ownerId = Number(env.TELEGRAM_CHAT_ID);
  if (!Number.isSafeInteger(ownerId)) return;
  globals.__workshopBotPollingStarted = true;

  const bot = createWorkshopBot({
    token: env.TELEGRAM_BOT_TOKEN,
    ownerId,
    db,
    now: () => new Date(),
  });
  // The default handler rethrows and stops polling; a failed update must not take the bot down.
  bot.catch((err) => console.error('[workshop-bot]', describeError(err.error)));

  let stopped = false;
  for (const sig of STOP_SIGNALS) {
    // Confirms the last offset so the next process does not get a 409 for long.
    process.once(sig, () => {
      stopped = true;
      bot.stop().catch((err) => console.error('[workshop-bot]', describeError(err)));
    });
  }

  void runPollingSupervisor({
    start: () =>
      bot.start({
        allowed_updates: [...BOT.pollingAllowedUpdates],
        drop_pending_updates: false,
      }),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    log: (message) => console.error('[workshop-bot]', message),
    delays: BOT.pollingRestartDelaysMs,
    healthyMs: BOT.pollingHealthyMs,
    now: Date.now,
    isStopped: () => stopped,
  }).catch((err) => console.error('[workshop-bot]', describeError(err)));
}
