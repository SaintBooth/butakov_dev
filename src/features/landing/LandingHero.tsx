import { ArrowRight, ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { LandingId } from '@/config/landings';
import { landings } from '@/data/landings';
import { ContactTrigger } from '@/features/contact/ContactTrigger';
import { Link } from '@/i18n/navigation';

interface LandingHeroProps {
  id: LandingId;
  locale: string;
}

export default async function LandingHero({ id, locale }: LandingHeroProps) {
  const t = await getTranslations({ locale, namespace: `landings.${id}` });
  const tc = await getTranslations({ locale, namespace: 'landingsCommon' });
  const { Icon, serviceId } = landings[id];

  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-teal-400/25 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-end">
        <div className="lg:col-span-8">
          <nav aria-label={tc('breadcrumbHome')}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500 mb-5 md:mb-6">
              <li>
                <Link href="/" className="hover:text-teal-700 transition-colors">
                  {tc('breadcrumbHome')}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4" />
              </li>
              <li aria-current="page" className="text-slate-700">
                {t('breadcrumb')}
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
            {t('h1')}
          </h1>
          <p className="mt-5 md:mt-6 text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-[62ch]">
            {t('lead')}
          </p>
          <div className="mt-7 md:mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <ContactTrigger
              serviceId={serviceId}
              className="px-8 py-3.5 md:py-4 rounded-full bg-teal-800 text-white font-bold hover:bg-teal-900 transition inline-flex items-center justify-center gap-2 group shadow-xl shadow-teal-500/20 active:scale-95"
            >
              {tc('cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </ContactTrigger>
            <a
              href="#pricing"
              className="self-center sm:self-auto py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 underline decoration-slate-300 hover:decoration-teal-400 underline-offset-4 transition-colors"
            >
              {tc('pricesLink')}
            </a>
          </div>
        </div>
        <div className="hidden lg:flex lg:col-span-4 justify-end" aria-hidden="true">
          <div className="w-56 h-56 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-teal-900/10 flex items-center justify-center rotate-3">
            <Icon className="w-24 h-24 text-teal-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
