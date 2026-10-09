import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cache } from 'react';
import { WORKSHOP_LOCALE, WORKSHOP_PATHS } from '@/config/workshop';
import { getWorkshopEnv } from '@/config/workshopEnv';
import { registerAction } from '@/features/workshop/actions/register';
import { getDb } from '@/features/workshop/db/client';
import { findSessionBySlug } from '@/features/workshop/db/sessions';
import { formatSessionDate } from '@/features/workshop/format';
import { signStamp } from '@/features/workshop/server/formStamp';
import { Notice } from '@/features/workshop/ui/Notice';
import { PageShell } from '@/features/workshop/ui/PageShell';
import { RegistrationForm } from '@/features/workshop/ui/RegistrationForm';

// The anti-bot stamp records render time, so a cached page would carry a stale one.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// generateMetadata and the page both need the session; cache() makes that one query per request.
const loadSession = cache(async (slug: string) => {
  const db = getDb();
  return db ? findSessionBySlug(db, slug) : null;
});

async function load(params: Props['params']) {
  const { locale, slug } = await params;
  const env = getWorkshopEnv();
  if (locale !== WORKSHOP_LOCALE || !env) notFound();
  const session = await loadSession(slug);
  if (!session) notFound();
  // Evaluated here, not in render: the React purity lint forbids Date.now() in components.
  const now = Date.now();
  const isOpen = session.registrationOpen && session.startsAt.getTime() > now;
  return { session, isOpen, stamp: signStamp(now, env.WORKSHOP_FORM_SECRET) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { session } = await load(params);
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop.meta' });
  return {
    title: t('register', { title: session.title }),
    robots: { index: false, follow: false },
  };
}

export default async function WorkshopRegisterPage({ params }: Props) {
  const { session, isOpen, stamp } = await load(params);
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop' });
  return (
    <PageShell eyebrow={t('register.eyebrow')} title={session.title}>
      <p className="text-slate-700">
        {t('register.when', { date: formatSessionDate(session.startsAt, t('timezoneLabel')) })}
      </p>
      {isOpen ? (
        <>
          <p className="text-sm text-slate-500">{t('register.intro')}</p>
          <RegistrationForm
            action={registerAction.bind(null, session.slug)}
            stamp={stamp}
            icsHref={WORKSHOP_PATHS.ics(session.slug)}
          />
        </>
      ) : (
        <Notice tone="info">{t('register.closed')}</Notice>
      )}
    </PageShell>
  );
}
