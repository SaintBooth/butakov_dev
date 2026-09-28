import { getTranslations } from 'next-intl/server';
import type { LandingId } from '@/config/landings';
import { landings } from '@/data/landings';

interface LandingStepsProps {
  id: LandingId;
  locale: string;
}

export default async function LandingSteps({ id, locale }: LandingStepsProps) {
  const t = await getTranslations({ locale, namespace: `landings.${id}.steps` });
  const { stepIds } = landings[id];

  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 md:mb-14">
          {t('heading')}
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {stepIds.map((stepId, i) => (
            <li key={stepId} className="relative pl-14 lg:pl-0 lg:pt-16">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center tabular-nums"
              >
                {i + 1}
              </span>
              {i < stepIds.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute top-5 left-14 right-2 h-px bg-gradient-to-r from-teal-300 to-transparent"
                />
              )}
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t(`items.${stepId}.title`)}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                {t(`items.${stepId}.text`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
