import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { checkinAction } from '@/features/workshop/actions/checkin';
import { getDb } from '@/features/workshop/db/client';
import { findSessionBySlug } from '@/features/workshop/db/sessions';
import { CheckinForm } from '@/features/workshop/ui/CheckinForm';
import { workshopPageMetadata } from '@/features/workshop/metadata';
import { PageShell } from '@/features/workshop/ui/PageShell';

export const dynamic = 'force-dynamic';
export const generateMetadata = (): Promise<Metadata> => workshopPageMetadata('checkin');

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !db) notFound();
  const session = await findSessionBySlug(db, slug);
  if (!session) notFound();
  const t = await getTranslations({ locale, namespace: 'workshop' });
  return (
    <PageShell eyebrow={session.title} title={t('meta.checkin')}>
      <p className="text-slate-700">{t('checkin.intro')}</p>
      <CheckinForm action={checkinAction.bind(null, session.slug)} />
    </PageShell>
  );
}
