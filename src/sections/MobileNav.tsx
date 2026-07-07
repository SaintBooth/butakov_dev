'use client';

import { Home, BookOpen, LayoutGrid, MessageSquare } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 rounded-2xl mb-4 p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)] pointer-events-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <Link
          href="/"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Главная</span>
        </Link>
        <Link
          href="/journal"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Журнал</span>
        </Link>
        <Link
          href="/#cases"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-slate-300 hover:text-white transition-colors"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Кейсы</span>
        </Link>
        <Link
          href="/#contact"
          className="relative z-10 flex-1 flex flex-col items-center gap-1.5 p-2 text-teal-400 hover:text-teal-300 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-wide">Связь</span>
        </Link>
      </div>
    </div>
  );
}
