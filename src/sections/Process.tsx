import { getTranslations } from 'next-intl/server';
import { clsx } from 'clsx';
import { processSteps } from '../data/processSteps';

export default async function Process() {
  const t = await getTranslations('process');

  return (
    <section id="process" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">{t('subheading')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-8 relative">
          <div className="hidden md:block absolute top-[52px] left-0 w-full h-0.5 bg-white shadow-sm z-0" />
          {processSteps.map((item) => {
            const isFirst = item.id === '01';
            return (
              <div
                key={item.id}
                className="relative z-10 flex flex-col items-center text-center px-6 md:px-2"
              >
                <div
                  className={clsx(
                    'rounded-full bg-white/80 backdrop-blur-xl border-4 border-white flex items-center justify-center font-extrabold text-teal-500 mb-6 shadow-xl shadow-slate-200/50',
                    isFirst ? 'w-28 h-28 text-3xl' : 'w-24 h-24 text-2xl'
                  )}
                >
                  {item.id}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {t(`steps.${item.id}.title`)}
                </h3>
                <p className="text-slate-600 font-medium">{t(`steps.${item.id}.desc`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
