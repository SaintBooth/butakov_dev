import { clsx } from 'clsx';
import { Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { LandingId } from '@/config/landings';
import { landings } from '@/data/landings';
import type { PriceVars } from './priceVars';

// Explicit class per tier count: Tailwind can't see dynamically built class names.
const GRID_COLS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const;

interface LandingPricingProps {
  id: LandingId;
  locale: string;
  vars: PriceVars;
}

export default async function LandingPricing({ id, locale, vars }: LandingPricingProps) {
  const t = await getTranslations({ locale, namespace: `landings.${id}.pricing` });
  const tc = await getTranslations({ locale, namespace: 'landingsCommon' });
  const { tiers } = landings[id];
  const count = Math.min(Math.max(tiers.length, 2), 4) as 2 | 3 | 4;

  return (
    <section
      id="pricing"
      className="py-16 md:py-24 relative z-10 border-t border-white/40 bg-gradient-to-b from-slate-50/80 via-white/60 to-slate-50/80 scroll-mt-24 scroll-reveal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">{t('lead')}</p>
        </div>

        <ul className={clsx('grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6', GRID_COLS[count])}>
          {tiers.map((tier) => {
            const price = String(vars[tier.id]);
            return (
              <li
                key={tier.id}
                className="flex flex-col p-7 md:p-8 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4 min-h-[3.5rem]">
                  {t(`tiers.${tier.id}.name`)}
                </h3>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                  {tier.monthly ? tc('perMonth', { price }) : tc('from', { price })}
                </p>
                {tier.monthly && (
                  <p className="mt-1 text-sm font-bold text-teal-700">
                    {tc('hoursIncluded', { hours: tier.hours })}
                  </p>
                )}
                <p className="mt-4 text-slate-600 font-medium leading-relaxed flex-grow">
                  {t(`tiers.${tier.id}.text`)}
                </p>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
                  {t(`tiers.${tier.id}.duration`)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 max-w-3xl space-y-2 text-slate-600 font-medium leading-relaxed">
          <p>{t('note', vars)}</p>
          <p className="font-bold text-slate-800">{tc('estimate')}</p>
        </div>
      </div>
    </section>
  );
}
