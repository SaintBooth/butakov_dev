import { webhookCallback } from 'grammy';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '../db/client';
import { createWorkshopBot } from './bot';

type Handler = (req: Request) => Promise<Response>;
// On globalThis so that dev hot reloads do not build a second bot per module re-evaluation.
const globals = globalThis as typeof globalThis & { __workshopBotHandler?: Handler | null };

export function getWebhookHandler(): Handler | null {
  if (globals.__workshopBotHandler !== undefined) return globals.__workshopBotHandler;
  const env = getWorkshopEnv();
  const db = getDb();
  const ownerId = Number(env?.TELEGRAM_CHAT_ID);
  if (
    !env?.TELEGRAM_BOT_TOKEN ||
    !env.TELEGRAM_WEBHOOK_SECRET ||
    !Number.isSafeInteger(ownerId) ||
    !db
  ) {
    globals.__workshopBotHandler = null;
    return null;
  }
  const bot = createWorkshopBot({
    token: env.TELEGRAM_BOT_TOKEN,
    ownerId,
    db,
    now: () => new Date(),
  });
  globals.__workshopBotHandler = webhookCallback(bot, 'std/http', {
    secretToken: env.TELEGRAM_WEBHOOK_SECRET,
    // The route already answers 200 on failures; a slow update must not become a 500 retry either.
    onTimeout: 'return',
  });
  return globals.__workshopBotHandler;
}
