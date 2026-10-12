import { headers } from 'next/headers';
import { z } from 'zod';
import { TOKEN_MAX_LENGTH } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '@/features/workshop/db/client';
import { buildExport } from '@/features/workshop/db/export';
import { findSessionBySlug } from '@/features/workshop/db/sessions';
import { findViewLinkSession } from '@/features/workshop/db/viewLinks';
import { toCsv } from '@/features/workshop/export/csv';
import { createAdminGate } from '@/features/workshop/server/adminGate';
import { getClientIp } from '@/features/workshop/server/clientIp';
import { viewLinkFailures } from '@/features/workshop/server/viewLinkGate';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  session: z.string().regex(/^[a-z0-9-]{3,60}$/),
  kind: z.enum(['attendees', 'feedback', 'summary', 'program']),
  t: z.string().min(1).max(TOKEN_MAX_LENGTH).optional(),
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
  const query = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!query.success) return reply('Bad request', 400);

  if (query.data.t !== undefined) {
    const badLinks = viewLinkFailures();
    if (ip && badLinks.isLimited(ip)) return reply('Too many requests', 429);
    const session = await findSessionBySlug(db, query.data.session);
    const linked = await findViewLinkSession(db, query.data.t, new Date());
    // One answer for an unknown session and a foreign token, so a token cannot probe slugs.
    if (!session || linked !== session.id) {
      if (ip) badLinks.hit(ip);
      return reply('Not found', 404);
    }
  } else {
    const auth = gate(req.headers.get('authorization'), env.WORKSHOP_ADMIN_TOKEN, ip);
    if (auth === 'limited') return reply('Too many requests', 429);
    if (auth === 'unauthorized') return reply('Unauthorized', 401);
  }

  const table = await buildExport(db, query.data.session, query.data.kind);
  if (!table) return reply('Not found', 404);
  return reply(toCsv(table.headers, table.rows), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${query.data.session}-${query.data.kind}.csv"`,
  });
}
