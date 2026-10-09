import { headers } from 'next/headers';
import { z } from 'zod';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '@/features/workshop/db/client';
import { buildExport } from '@/features/workshop/db/export';
import { toCsv } from '@/features/workshop/export/csv';
import { createAdminGate } from '@/features/workshop/server/adminGate';
import { getClientIp } from '@/features/workshop/server/clientIp';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  session: z.string().regex(/^[a-z0-9-]{3,60}$/),
  kind: z.enum(['attendees', 'feedback', 'summary', 'program']),
});

const gate = createAdminGate();

// Personal data must never be cached by a proxy, including in error responses.
function reply(body: string, status: number, extra: Record<string, string> = {}) {
  return new Response(body, { status, headers: { 'cache-control': 'no-store', ...extra } });
}

export async function GET(req: Request) {
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db) return reply('Unavailable', 503);
  const ip = getClientIp(await headers(), env.WORKSHOP_IP_HEADER);
  const auth = gate(req.headers.get('authorization'), env.WORKSHOP_ADMIN_TOKEN, ip);
  if (auth === 'limited') return reply('Too many requests', 429);
  if (auth === 'unauthorized') return reply('Unauthorized', 401);
  const query = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!query.success) return reply('Bad request', 400);

  const table = await buildExport(db, query.data.session, query.data.kind);
  if (!table) return reply('Not found', 404);
  return reply(toCsv(table.headers, table.rows), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${query.data.session}-${query.data.kind}.csv"`,
  });
}
