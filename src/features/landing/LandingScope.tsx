import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { LandingId } from '@/config/landings';
import { landings } from '@/data/landings';

interface LandingScopeProps {
  id: LandingId;
  locale: string;
}

export default async function LandingScope({ id, locale }: LandingScopeProps) {
  const t = await getTranslations({ locale, namespace: `landings.${id}.scope` });
  const { scopeIds } = landings[id];

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 md:mb-12 max-w-2xl">
          {t('heading')}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {scopeIds.map((itemId, i) => (
            <li
              key={itemId}
              className={clsx(
                'p-7 md:p-9 rounded-[2rem] border shadow-lg shadow-slate-200/40',
                i === 0
                  ? 'bg-gradient-to-br from-teal-50 to-white border-teal-100'
                  : 'bg-white/60 backdrop-blur-xl border-white'
              )}
            >
              <CheckCircle2 className="w-7 h-7 text-teal-500 mb-5" aria-hidden="true" />
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                {t(`items.${itemId}.title`)}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                {t(`items.${itemId}.text`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
