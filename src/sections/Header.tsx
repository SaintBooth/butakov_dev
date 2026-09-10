'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { CTA_HREF, NAV_ITEMS } from '@/config/nav';
import { Link } from '@/i18n/navigation';
import { LogoImage } from '../components/ui/LogoImage/LogoImage';
import MobileMenu from './MobileMenu';

export default function Header() {
  const t = useTranslations('nav');

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex h-14 items-center justify-between md:h-16" aria-label={t('ariaLabel')}>
          <Link href="/" className="-m-2 flex-shrink-0 p-2" aria-label={t('home')}>
            <LogoImage width={256} height={88} priority className="h-9 w-auto object-contain" />
          </Link>

          <Suspense fallback={<div className="size-11 md:hidden" aria-hidden />}>
            <MobileMenu />
          </Suspense>

          <div className="hidden items-center space-x-8 md:flex">
            {NAV_ITEMS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-teal-600"
              >
                {t(key)}
              </Link>
            ))}
            <Link
              href={CTA_HREF}
              className="group flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-teal-500"
            >
              <MessageSquare className="h-4 w-4 text-teal-400 transition-colors group-hover:text-white" />
              {t('cta')}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
