import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import { PageShell } from '@/features/workshop/ui/PageShell';

interface Section {
  title: string;
  body: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: WORKSHOP_LOCALE, namespace: 'workshop.meta' });
  return { title: t('privacy') };
}

export default async function WorkshopPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== WORKSHOP_LOCALE) notFound();
  const t = await getTranslations({ locale, namespace: 'workshop' });
  const sections = t.raw('privacy.sections') as Section[];
  return (
    <PageShell title={t('meta.privacy')}>
      <p className="text-sm text-slate-500">{t('privacy.updated')}</p>
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
          <p className="mt-1 text-slate-700">{s.body}</p>
        </section>
      ))}
    </PageShell>
  );
}
