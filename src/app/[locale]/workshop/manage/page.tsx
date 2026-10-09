import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { REGISTRATION_STATUS, WORKSHOP_LOCALE } from '@/config/workshop';
import { manageAction } from '@/features/workshop/actions/manage';
import { getDb } from '@/features/workshop/db/client';
import { formatSessionDate } from '@/features/workshop/format';
import { resolveToken, tokenFromParam } from '@/features/workshop/server/tokenAccess';
import { ManagePanel } from '@/features/workshop/ui/ManagePanel';
import { Notice } from '@/features/workshop/ui/Notice';
import { PageShell } from '@/features/workshop/ui/PageShell';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}

export default async function ManagePage({ params, searchParams }: Props) {
  const [{ locale }, { t: token }] = await Promise.all([params, searchParams]);
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !db) notFound();
  const t = await getTranslations({ locale, namespace: 'workshop' });
  const access = await resolveToken(db, token, 'manage', new Date());
  if (access.state !== 'valid') {
    return (
      <PageShell title={t('meta.manage')}>
        <Notice tone="error">{t(`token.${access.state}`)}</Notice>
      </PageShell>
    );
  }
  const { ctx } = access;
  return (
    <PageShell title={t('meta.manage')}>
      <p className="text-slate-700">
        {t('manage.intro', {
          title: ctx.sessionTitle,
          date: formatSessionDate(ctx.sessionStartsAt, t('timezoneLabel')),
        })}
      </p>
      <Notice tone="info">{t(`manage.status.${ctx.registrationStatus}`)}</Notice>
      <ManagePanel
        action={manageAction.bind(null, tokenFromParam(token))}
        canCancel={ctx.registrationStatus === REGISTRATION_STATUS.registered}
      />
    </PageShell>
  );
}
