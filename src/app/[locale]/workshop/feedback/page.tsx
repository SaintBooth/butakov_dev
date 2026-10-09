import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { feedbackAction } from '@/features/workshop/actions/feedback';
import { getDb } from '@/features/workshop/db/client';
import { resolveToken, tokenFromParam } from '@/features/workshop/server/tokenAccess';
import { FeedbackForm } from '@/features/workshop/ui/FeedbackForm';
import { Notice } from '@/features/workshop/ui/Notice';
import { PageShell } from '@/features/workshop/ui/PageShell';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}

export default async function FeedbackPage({ params, searchParams }: Props) {
  const [{ locale }, { t: token }] = await Promise.all([params, searchParams]);
  const db = getDb();
  if (locale !== WORKSHOP_LOCALE || !db) notFound();
  const t = await getTranslations({ locale, namespace: 'workshop' });
  const access = await resolveToken(db, token, 'feedback', new Date());
  return (
    <PageShell title={t('meta.feedback')}>
      {access.state === 'valid' ? (
        <>
          <p className="text-slate-700">
            {t('feedback.intro', { title: access.ctx.sessionTitle })}
          </p>
          <FeedbackForm action={feedbackAction.bind(null, tokenFromParam(token))} />
        </>
      ) : (
        <Notice tone={access.state === 'used' ? 'success' : 'error'}>
          {t(`token.${access.state}`)}
        </Notice>
      )}
    </PageShell>
  );
}
