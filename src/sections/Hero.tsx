import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Hero() {
  const t = await getTranslations('hero');

  return (
    <section className="relative overflow-hidden min-h-dvh flex items-center pt-10 pb-10 md:pt-24 md:pb-20">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-teal-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-slate-200/50 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-6 lg:gap-16 items-center">
        {/* Photo leads on mobile (order-first): on compact viewports (iPhone
            SE-class, 667px tall) the full text stack alone nearly fills the
            screen, so a full-size portrait after it renders almost entirely
            below the fold. Small + first on mobile keeps it visible without
            scroll; desktop keeps the original asymmetric split. */}
        <div className="order-first lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-40 sm:w-56 lg:w-full lg:max-w-md aspect-[3/4] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-white shadow-xl shadow-slate-200/50">
            <Image
              src="/hero-portrait.jpg"
              alt="Александр Бутаков"
              fill
              priority
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 224px, 420px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="order-last lg:order-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 text-slate-900 leading-tight">
            {t('titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-700">
              {t('titleAccent')}
            </span>{' '}
            {t('titleSuffix')}
          </h1>
          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl mb-6 md:mb-10 leading-relaxed font-medium">
            {t('subtitle')}
          </p>
          <div className="flex flex-col items-center lg:items-start gap-3">
            <a
              href="#contact"
              className="px-8 py-3.5 md:py-4 rounded-full bg-teal-500 text-white font-bold hover:bg-teal-600 transition inline-flex items-center justify-center gap-2 group shadow-xl shadow-teal-500/20 active:scale-95"
            >
              {t('cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#b2b"
              className="py-2 -my-2 text-sm font-semibold text-slate-500 hover:text-teal-600 underline decoration-slate-300 hover:decoration-teal-400 underline-offset-4 transition-colors"
            >
              {t('guarantees')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
