import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-dvh flex flex-col justify-center pt-20 pb-16 md:pt-24 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-sm font-semibold text-slate-700 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          Открыт к B2B сотрудничеству
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
          Технический{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
            партнер
          </span>{' '}
          <br className="hidden md:block" />
          для вашего бизнеса
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Помогаю бизнесу реализовывать понятные цели через надежные веб-приложения, e-commerce и
          ИИ. Работаю от бизнес-задачи, официально, с гарантией.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-teal-500 text-white font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-teal-500/20 active:scale-95"
          >
            Связаться со мной
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#b2b"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/70 backdrop-blur-md text-slate-900 font-bold hover:bg-white/90 border border-white transition-all text-center shadow-sm active:scale-95"
          >
            Узнать о гарантиях
          </a>
        </div>
      </div>
    </section>
  );
}
