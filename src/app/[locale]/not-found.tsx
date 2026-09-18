import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-bold uppercase tracking-wider text-teal-600">404</p>
      <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{t('heading')}</h1>
      <p className="mb-8 max-w-md text-slate-600">{t('description')}</p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-600"
        >
          {t('cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/journal"
          className="text-sm font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-teal-600 hover:decoration-teal-400"
        >
          {t('ctaJournal')}
        </Link>
      </div>
    </main>
  );
}
