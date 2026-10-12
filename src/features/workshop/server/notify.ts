import { z } from 'zod';
import { TELEGRAM_API_BASE, TELEGRAM_TIMEOUT_MS } from '@/config/workshop';
import type { WorkshopEnv } from '@/config/workshopEnv';

const telegramResponseSchema = z.object({ ok: z.boolean() });

// Best effort: an owner ping must never fail a user action. Texts carry counts and ids only.
export async function notifyOwner(env: WorkshopEnv, text: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });
    const parsed = telegramResponseSchema.safeParse(await res.json());
    if (!parsed.success || !parsed.data.ok) console.error('[workshop] telegram notify rejected');
  } catch {
    console.error('[workshop] telegram notify failed');
  }
}
