import { Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { LandingId } from '@/config/landings';
import type { PriceVars } from './priceVars';

interface LandingWhyProps {
  id: LandingId;
  locale: string;
  vars: PriceVars;
}

export default async function LandingWhy({ id, locale, vars }: LandingWhyProps) {
  const t = await getTranslations({ locale, namespace: `landings.${id}.why` });
  const tc = await getTranslations({ locale, namespace: 'landingsCommon' });

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t('heading')}</h2>
          <p className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed max-w-[62ch]">
            {t('text', vars)}
          </p>
        </div>
        <aside className="lg:col-span-5 p-7 md:p-8 rounded-[2rem] bg-slate-900 text-slate-200 shadow-xl shadow-slate-900/20">
          <p className="flex items-center gap-2 text-sm font-bold text-teal-300 mb-3">
            <Info className="w-4 h-4" aria-hidden="true" />
            {tc('limitsLabel')}
          </p>
          <p className="font-medium leading-relaxed">{t('limits')}</p>
        </aside>
      </div>
    </section>
  );
}
