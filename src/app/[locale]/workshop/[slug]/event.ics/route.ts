import { notFound } from 'next/navigation';
import { absoluteUrl, icsUid, WORKSHOP_LOCALE, WORKSHOP_PATHS } from '@/config/workshop';
import { getDb } from '@/features/workshop/db/client';
import { findSessionBySlug } from '@/features/workshop/db/sessions';
import { buildIcs } from '@/features/workshop/ics';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !db) notFound();
  const session = await findSessionBySlug(db, slug);
  if (!session) notFound();
  // Public file: the meeting link is left out on purpose, it only goes out by email.
  const ics = buildIcs({
    uid: icsUid(session.slug),
    title: session.title,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    now: new Date(),
    url: absoluteUrl(WORKSHOP_PATHS.register(session.slug)),
  });
  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${session.slug}.ics"`,
    },
  });
}
