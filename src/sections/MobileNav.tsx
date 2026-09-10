'use client';

import { clsx } from 'clsx';
import { BookOpen, Home, LayoutGrid, MessageSquare, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  accent?: boolean;
}

function NavItem({ href, label, icon: Icon, active, accent = false }: NavItemProps) {
  const tone = accent
    ? 'text-teal-600 [@media(hover:hover)]:hover:text-teal-700'
    : active
      ? 'text-slate-900'
      : 'text-slate-500 [@media(hover:hover)]:hover:text-slate-900';

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'relative z-10 flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5',
        'transition-transform duration-100 will-change-transform active:scale-95',
        'motion-reduce:transition-none motion-reduce:active:scale-100',
        active && (accent ? 'bg-teal-500/10' : 'bg-slate-900/[0.06]')
      )}
    >
      <Icon
        className={clsx('size-[22px] transition-colors', tone)}
        strokeWidth={active ? 2.4 : 2}
      />
      <span
        className={clsx(
          'text-[11px] tracking-[0.02em] transition-colors',
          active ? 'font-semibold' : 'font-medium',
          tone
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export default function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isJournal = pathname.startsWith('/journal');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label={t('ariaLabel')}
        className={clsx(
          'pointer-events-auto relative flex items-center gap-1 overflow-hidden rounded-2xl p-1.5',
          'border border-white/70 bg-white/70 supports-[backdrop-filter]:bg-white/55',
          'backdrop-blur-2xl backdrop-saturate-150',
          'shadow-[0_10px_40px_-8px_rgba(15,23,42,0.18)]',
          '[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none'
        )}
      >
        {/* top edge catching light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent" />

        <NavItem href="/" label={t('home')} icon={Home} active={isHome} />
        <NavItem href="/journal" label={t('journal')} icon={BookOpen} active={isJournal} />
        <NavItem href="/#cases" label={t('cases')} icon={LayoutGrid} active={false} />
        <NavItem
          href="/#contact"
          label={t('contactShort')}
          icon={MessageSquare}
          active={false}
          accent
        />
      </nav>
    </div>
  );
}
