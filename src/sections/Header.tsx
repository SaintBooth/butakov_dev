'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LogoImage } from '../components/ui/LogoImage/LogoImage';

export default function Header() {
  const t = useTranslations('nav');

  return (
    <header className="fixed w-full z-50 top-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-14 md:h-16" aria-label={t('ariaLabel')}>
          <Link href="/" className="flex-shrink-0" aria-label={t('home')}>
            <LogoImage
              width={180}
              height={48}
              priority
              className="h-7 md:h-9 w-auto object-contain"
            />
          </Link>
          <div className="md:hidden">
            <Link
              href="/#contact"
              className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center active:scale-95 transition-all shadow-sm"
              aria-label={t('cta')}
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/#services"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {t('services')}
            </Link>
            <Link
              href="/#b2b"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {t('b2b')}
            </Link>
            <Link
              href="/#cases"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {t('cases')}
            </Link>
            <Link
              href="/#experience"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {t('experience')}
            </Link>
            <Link
              href="/journal"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              {t('journal')}
            </Link>
            <Link
              href="/#contact"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-teal-500 transition-all flex items-center gap-2 group shadow-lg shadow-slate-900/10"
            >
              <MessageSquare className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
              {t('cta')}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
