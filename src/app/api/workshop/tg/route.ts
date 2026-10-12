import { describeError } from '@/features/workshop/server/describeError';
import { getWebhookHandler } from '@/features/workshop/bot/instance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const handle = getWebhookHandler();
  // Bot not configured: look like any missing route.
  if (!handle) return new Response(null, { status: 404 });
  // After the secret check anything but 200 makes Telegram redeliver, repeating non-idempotent actions.
  try {
    return await handle(req);
  } catch (err) {
    console.error('[workshop-bot]', describeError(err));
    return new Response(null, { status: 200 });
  }
}

export async function GET(): Promise<Response> {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}
