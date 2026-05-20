import { Home, Building2, LayoutGrid, MessageSquare } from 'lucide-react';

export default function MobileNav({ onContactClick }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-2xl mb-4 p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)] pointer-events-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Главная</span>
        </button>
        <a
          href="#b2b"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Партнерам</span>
        </a>
        <a
          href="#cases"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Кейсы</span>
        </a>
        <button
          onClick={onContactClick}
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-teal-400 hover:text-teal-300 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Связь</span>
        </button>
      </div>
    </div>
  );
}
