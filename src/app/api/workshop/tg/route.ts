import { getWebhookHandler } from '@/features/workshop/bot/instance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  const handle = getWebhookHandler();
  // Bot not configured: look like any missing route.
  if (!handle) return new Response(null, { status: 404 });
  return handle(req);
}

export async function GET(): Promise<Response> {
  return new Response(null, { status: 405, headers: { allow: 'POST' } });
}
