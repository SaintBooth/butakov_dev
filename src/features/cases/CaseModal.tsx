import { X, ArrowRight, LineChart } from 'lucide-react';
import Modal from '../../components/ui/Modal/Modal';
import type { PortfolioCase } from '../../types';
import { renderTextWithCodeBlocks } from '../../utils/renderTextWithCodeBlocks';

interface CaseModalProps {
  item: PortfolioCase;
  onClose: () => void;
  onContactClick: () => void;
}

export default function CaseModal({ item, onClose, onContactClick }: CaseModalProps) {
  return (
    <Modal
      onClose={onClose}
      className="max-w-4xl bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem]"
    >
      <div className={`h-48 sm:h-64 w-full bg-gradient-to-br ${item.gradient} relative`}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-8 sm:p-10 md:p-12">
        <div className="inline-block px-4 py-1.5 bg-teal-50 rounded-full text-xs font-bold text-teal-700 mb-5 border border-teal-100">
          {item.category}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
          {item.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div className="md:col-span-2 space-y-5">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              О проекте
            </h3>
            {item.problem && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Проблема
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {item.problem}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Решение
              </h4>
              {renderTextWithCodeBlocks(item.solution ?? item.fullDescription, 'case-solution')}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Результат
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                {item.result ?? item.metric}
              </p>
            </div>
          </div>
          <div className="space-y-8 bg-white/50 p-6 md:p-8 rounded-3xl border border-white h-fit shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Метрика
              </h4>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3 border border-white shadow-sm">
                <LineChart className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-teal-900">{item.metric}</span>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Стек технологий
              </h4>
              <div className="flex flex-wrap gap-2">
                {(item.techStack ?? item.tags).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white text-slate-600 text-xs font-bold rounded-lg shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
            Готовы обсудить подобную задачу?
          </p>
          <button
            onClick={() => {
              onClose();
              setTimeout(onContactClick, 150);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-500 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
          >
            Обсудить проект
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
