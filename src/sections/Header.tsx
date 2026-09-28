'use client';

import { clsx } from 'clsx';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { isNavActive, NAV_ITEMS } from '@/config/nav';
import { ContactTrigger } from '@/features/contact/ContactTrigger';
import { Link, usePathname } from '@/i18n/navigation';
import ServicesMenu from './ServicesMenu';
import { LogoImage } from '../components/ui/LogoImage/LogoImage';
import MobileMenu from './MobileMenu';

// Re-read on every render: client navigations re-render the header via usePathname.
const noopSubscribe = () => () => {};

export default function Header() {
  const t = useTranslations('nav');
  // Bar height (mt-3 + h-14 = 68px) never changes — only the glass surface
  // fades in on scroll — so nothing below ever jumps when this flips.
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Read ?filter= after hydration instead of useSearchParams: that hook needs a
  // Suspense boundary, which would drop these nav links from the static HTML.
  const search = useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => ''
  );
  const query = new URLSearchParams(search);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 lg:px-8">
      <div
        className={clsx(
          'w-full max-w-7xl rounded-2xl border transition-all duration-300',
          scrolled
            ? 'border-slate-200/70 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-2xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <nav
          className="flex h-14 items-center justify-between px-4 sm:px-6 md:h-16 lg:px-8"
          aria-label={t('ariaLabel')}
        >
          <Link href="/" className="-m-2 flex-shrink-0 p-2" aria-label={t('home')}>
            <LogoImage width={256} height={88} priority className="h-9 w-auto object-contain" />
          </Link>

          <Suspense fallback={<div className="size-11 md:hidden" aria-hidden />}>
            <MobileMenu />
          </Suspense>

          <div className="hidden items-center space-x-8 md:flex">
            {NAV_ITEMS.map(({ key, href }) => {
              const active = isNavActive(key, pathname, query);
              if (key === 'services') return <ServicesMenu key={key} active={active} />;
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'text-sm font-semibold transition-colors hover:text-teal-600',
                    active ? 'text-slate-900' : 'text-slate-600'
                  )}
                >
                  {t(key)}
                </Link>
              );
            })}
            <ContactTrigger className="group flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-teal-500">
              <MessageSquare className="h-4 w-4 text-teal-400 transition-colors group-hover:text-white" />
              {t('cta')}
            </ContactTrigger>
          </div>
        </nav>
      </div>
    </header>
  );
}
