import { MessageSquare } from 'lucide-react';
import { LogoImage } from '../components/ui/LogoImage/LogoImage.jsx';

export default function Header({ onContactClick }) {
  return (
    <header className="fixed w-full z-50 top-0 border-b border-white/40 bg-white/60 backdrop-blur-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex justify-between items-center h-16 md:h-24"
          aria-label="Главная навигация"
        >
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
            role="button"
            tabIndex={0}
            aria-label="Наверх"
          >
            <LogoImage
              width={180}
              height={48}
              priority
              className="h-8 md:h-12 w-auto object-contain"
            />
          </div>
          <div className="md:hidden">
            <button
              onClick={onContactClick}
              className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              aria-label="Обсудить проект"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#services"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              Стек и Услуги
            </a>
            <a
              href="#b2b"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              B2B Партнерство
            </a>
            <a
              href="#cases"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              Кейсы
            </a>
            <a
              href="#experience"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              Опыт
            </a>
            <button
              onClick={onContactClick}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-teal-500 transition-all flex items-center gap-2 group shadow-lg shadow-slate-900/10"
            >
              <MessageSquare className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
              Обсудить проект
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
