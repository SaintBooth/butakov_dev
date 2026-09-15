import { getTranslations } from 'next-intl/server';
import { b2bGuarantees } from '../data/b2bGuarantees';

export default async function B2bGuarantees() {
  const t = await getTranslations('b2bGuarantees');

  return (
    <section id="b2b" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">{t('subheading')}</p>
        </div>
        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {b2bGuarantees.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                <item.Icon className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t(`items.${item.id}.title`)}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {t(`items.${item.id}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
