import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Hero() {
  const t = await getTranslations('hero');

  return (
    <section className="relative overflow-hidden min-h-dvh flex items-center pt-20 pb-16 md:pt-24 md:pb-20">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-teal-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-slate-200/50 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-sm font-semibold text-slate-700 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            {t('badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
            {t('titlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
              {t('titleAccent')}
            </span>{' '}
            <br className="hidden md:block" />
            {t('titleSuffix')}
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl mb-10 leading-relaxed font-medium">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-teal-500 text-white font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-teal-500/20 active:scale-95"
            >
              {t('cta')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#b2b"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300 transition-all text-center shadow-md active:scale-95"
            >
              {t('guarantees')}
            </a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-56 sm:w-72 lg:w-full lg:max-w-md aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white shadow-xl shadow-slate-200/50">
            <Image
              src="/hero-portrait.jpg"
              alt="Александр Бутаков"
              fill
              priority
              sizes="(max-width: 1024px) 288px, 420px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
