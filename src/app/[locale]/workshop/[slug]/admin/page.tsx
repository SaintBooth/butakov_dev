import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { listAdminParticipants } from '@/features/workshop/db/adminView';
import { getDb } from '@/features/workshop/db/client';
import { sessionCounts } from '@/features/workshop/db/sessions';
import { formatSessionDate } from '@/features/workshop/format';
import { workshopPageMetadata } from '@/features/workshop/metadata';
import { getClientIp } from '@/features/workshop/server/clientIp';
import { checkViewLink } from '@/features/workshop/server/viewLinkGate';
import { AdminParticipants } from '@/features/workshop/ui/AdminParticipants';
import { PageShell } from '@/features/workshop/ui/PageShell';

// Personal data behind a bearer link: never cached, never prerendered.
export const dynamic = 'force-dynamic';
export const generateMetadata = (): Promise<Metadata> => workshopPageMetadata('admin');

const CSV_KINDS = ['attendees', 'feedback', 'summary', 'program'] as const;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function WorkshopAdminPage({ params, searchParams }: Props) {
  const [{ locale, slug }, { t: token }] = await Promise.all([params, searchParams]);
  const env = getWorkshopEnv();
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !env || !db || !token) notFound();
  const ip = getClientIp(await headers(), env.WORKSHOP_IP_HEADER);
  // Same 404 for a limited ip, an unknown slug and a wrong or expired token: the page gives no hints.
  const session = await checkViewLink(db, slug, token, ip, new Date());
  if (!session) notFound();

  const [people, counts, t, tw] = await Promise.all([
    listAdminParticipants(db, session.id),
    sessionCounts(db, session.id),
    getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop.admin' }),
    getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' }),
  ]);
  const csvHref = (kind: (typeof CSV_KINDS)[number]) =>
    `/api/workshop/export?${new URLSearchParams({ session: slug, kind, t: token })}`;

  return (
    <PageShell eyebrow={t('eyebrow')} title={session.title}>
      <p className="text-slate-700">{formatSessionDate(session.startsAt, tw('timezoneLabel'))}</p>
      <p className="text-sm text-slate-600">{t('counts', { ...counts })}</p>
      <AdminParticipants
        people={people}
        labels={{
          filter: {
            all: t('filter.all'),
            registered: t('filter.registered'),
            attended: t('filter.attended'),
            cancelled: t('filter.cancelled'),
          },
          status: {
            registered: t('status.registered'),
            attended: t('status.attended'),
            cancelled: t('status.cancelled'),
          },
          recommendTemplate: t.raw('recommend') as string,
          followup: t('followup'),
          empty: t('empty'),
        }}
      />
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-sm font-semibold text-slate-900">{t('csv')}:</span>
        {CSV_KINDS.map((k) => (
          <a key={k} href={csvHref(k)} className="text-sm text-teal-700 underline">
            {t(`csvKinds.${k}`)}
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-500">{t('expires')}</p>
    </PageShell>
  );
}
