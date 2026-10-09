import { headers } from 'next/headers';
import { IP_CANDIDATE_HEADERS } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { createAdminGate } from '@/features/workshop/server/adminGate';
import { getClientIp } from '@/features/workshop/server/clientIp';

export const dynamic = 'force-dynamic';

const gate = createAdminGate();

function reply(body: BodyInit, status: number, extra: Record<string, string> = {}) {
  return new Response(body, { status, headers: { 'cache-control': 'no-store', ...extra } });
}

// Echoes only the caller's own request headers, behind the admin token.
export async function GET(req: Request) {
  const env = getWorkshopEnv();
  if (!env) return reply('Unavailable', 503);
  const h = await headers();
  const ip = getClientIp(h, env.WORKSHOP_IP_HEADER);
  const auth = gate(req.headers.get('authorization'), env.WORKSHOP_ADMIN_TOKEN, ip);
  if (auth === 'limited') return reply('Too many requests', 429);
  if (auth === 'unauthorized') return reply('Unauthorized', 401);
  return reply(
    JSON.stringify({
      headers: Object.fromEntries(IP_CANDIDATE_HEADERS.map((name) => [name, h.get(name)])),
      resolved: ip,
    }),
    200,
    { 'content-type': 'application/json' }
  );
}
