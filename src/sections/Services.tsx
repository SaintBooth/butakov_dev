import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { clsx } from 'clsx';
import { services } from '../data/services';

export default async function Services() {
  const t = await getTranslations('services');
  const [featured, ...rest] = services;

  return (
    <section id="services" className="py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('heading')}</h2>
            <p className="text-slate-600 text-lg font-medium">{t('subheading')}</p>
          </div>
        </div>

        {/* Featured service: a wide bar, not a tall quadrant — its text is
            only ~25% longer than the others, so a 4x-area card left most
            of it empty. Width scales with the section, height matches a
            regular card. */}
        <div className="group p-8 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white hover:border-teal-200/80 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-teal-500/20 transition-colors duration-300" />
          <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
            <featured.Icon className="w-10 h-10 text-teal-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {t(`items.${featured.id}.title`)}
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t(`items.${featured.id}.description`)}
            </p>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors group/btn flex-shrink-0 md:ml-4"
          >
            {t('cta')}
            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 5 cards don't divide evenly into a 3-col grid (3-over-2 orphans
            the last row). A 6-col grid fixes it: row of 3 at col-span-2
            (2*3=6, full width), row of 2 at col-span-3 (3*2=6, also full
            width, just wider cards) — every row fills the container. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {rest.map((service, i) => (
            <div
              key={service.id}
              className={clsx(
                'group p-8 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white hover:border-teal-200/80 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col',
                i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-teal-500/20 transition-colors duration-300" />
              <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                <service.Icon className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {t(`items.${service.id}.title`)}
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed font-medium flex-grow">
                {t(`items.${service.id}.description`)}
              </p>
              <a
                href="#contact"
                className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors group/btn mt-auto"
              >
                {t('cta')}
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
