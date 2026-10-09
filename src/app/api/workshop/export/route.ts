import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { getDb } from '@/features/workshop/db/client';
import { buildExport } from '@/features/workshop/db/export';
import { toCsv } from '@/features/workshop/export/csv';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  session: z.string().regex(/^[a-z0-9-]{3,60}$/),
  kind: z.enum(['attendees', 'feedback', 'summary', 'program']),
});

function authorized(header: string | null, token: string): boolean {
  const given = Buffer.from(header?.replace(/^Bearer /, '') ?? '');
  const expected = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(req: Request) {
  const env = getWorkshopEnv();
  const db = getDb();
  if (!env || !db) return new Response('Unavailable', { status: 503 });
  if (!authorized(req.headers.get('authorization'), env.WORKSHOP_ADMIN_TOKEN)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const query = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!query.success) return new Response('Bad request', { status: 400 });

  const table = await buildExport(db, query.data.session, query.data.kind);
  if (!table) return new Response('Not found', { status: 404 });
  return new Response(toCsv(table.headers, table.rows), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${query.data.session}-${query.data.kind}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
