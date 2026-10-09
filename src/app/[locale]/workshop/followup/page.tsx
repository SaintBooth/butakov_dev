import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { followupAction } from '@/features/workshop/actions/followup';
import { getDb } from '@/features/workshop/db/client';
import { resolveToken } from '@/features/workshop/server/tokenAccess';
import { FollowupForm } from '@/features/workshop/ui/FollowupForm';
import { Notice } from '@/features/workshop/ui/Notice';
import { PageShell } from '@/features/workshop/ui/PageShell';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function FollowupPage({ params, searchParams }: Props) {
  const [{ locale }, { t: token }] = await Promise.all([params, searchParams]);
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !db) notFound();
  const t = await getTranslations({ locale, namespace: 'workshop' });
  const access = await resolveToken(db, token, 'followup', new Date());
  return (
    <PageShell title={t('meta.followup')}>
      {access.state === 'valid' ? (
        <>
          <p className="text-slate-700">
            {t('followup.intro', { title: access.ctx.sessionTitle })}
          </p>
          <FollowupForm action={followupAction.bind(null, token ?? '')} />
        </>
      ) : (
        <Notice tone={access.state === 'used' ? 'success' : 'error'}>
          {t(`token.${access.state}`)}
        </Notice>
      )}
    </PageShell>
  );
}
