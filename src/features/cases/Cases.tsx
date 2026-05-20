import { ArrowRight, ArrowUpRight, LineChart } from 'lucide-react';
import { useSlider } from '../../components/ui/Slider/useSlider';
import { SliderControls } from '../../components/ui/Slider/SliderControls';
import type { PortfolioCase } from '../../types';
import { portfolioCases } from './portfolioCases';

interface CasesProps {
  onCaseSelect: (item: PortfolioCase) => void;
  onContactClick: () => void;
}

export default function Cases({ onCaseSelect, onContactClick }: CasesProps) {
  const { ref, scroll } = useSlider();

  return (
    <section id="cases" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Как мои решения помогли реальному бизнесу?
            </h2>
            <p className="text-slate-600 text-lg font-medium">
              Не просто код — конкретные метрики: конверсия, скорость ответа, аптайм.
            </p>
          </div>
          <div className="mt-6 md:mt-0 hidden md:flex items-center gap-6">
            <SliderControls onLeft={() => scroll('left')} onRight={() => scroll('right')} />
            <button
              onClick={onContactClick}
              className="text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-2 group ml-4 pl-8 border-l border-slate-300/50"
            >
              Обсудить проект{' '}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="flex overflow-x-auto gap-6 sm:gap-8 snap-x snap-mandatory no-scrollbar desktop-no-scrollbar pb-12 pt-4 scroll-smooth"
        >
          {portfolioCases.map((item) => (
            <div
              key={item.id}
              onClick={() => onCaseSelect(item)}
              className="shrink-0 w-[85vw] sm:w-[400px] lg:w-[450px] snap-start group bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all flex flex-col h-full cursor-pointer shadow-xl shadow-slate-200/40"
            >
              <div
                className={`h-48 w-full bg-gradient-to-br ${item.gradient} relative overflow-hidden flex-shrink-0`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-white/50 shadow-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900">
                  {item.category}
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-10 bg-white/40">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 font-medium text-sm mb-6 flex-grow line-clamp-3">
                  {item.description}
                </p>
                <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 mb-6 flex items-start gap-3 border border-white shadow-sm mt-auto">
                  <LineChart className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-teal-900">{item.metric}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/60 backdrop-blur-sm border border-white text-slate-600 text-xs font-bold rounded-md shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center md:hidden">
          <button
            onClick={onContactClick}
            className="inline-flex text-teal-600 font-bold hover:text-teal-700 transition-colors items-center gap-2 group"
          >
            Обсудить проект{' '}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
