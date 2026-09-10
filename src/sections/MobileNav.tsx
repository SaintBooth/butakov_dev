'use client';

import { clsx } from 'clsx';
import { BookOpen, Briefcase, Home, MessageSquare, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

// Fractal-noise micro-texture — sells "frosted" without a heavy gradient.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  accent?: boolean;
}

function NavItem({ href, label, icon: Icon, active, accent = false }: NavItemProps) {
  const tone = accent
    ? 'text-teal-700 [@media(hover:hover)]:hover:text-teal-800'
    : active
      ? 'text-slate-900'
      : 'text-slate-500 [@media(hover:hover)]:hover:text-slate-900';

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group relative z-10 flex h-14 flex-1 items-center justify-center rounded-2xl',
        // tactile press: quick squash + state layer, no layout shift for siblings
        'transition-[transform,background-color] duration-100 ease-out will-change-transform',
        'active:scale-90 active:bg-slate-900/[0.05]',
        '[@media(hover:hover)]:hover:bg-slate-900/[0.04]',
        'motion-reduce:transition-colors motion-reduce:active:scale-100',
        // selected = its own small frosted chip
        active && [
          'bg-white/55 backdrop-blur-sm',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85),0_1px_3px_-1px_rgba(15,23,42,0.12)]',
          accent ? 'ring-1 ring-teal-500/25' : 'ring-1 ring-white/60',
          '[@media(prefers-reduced-transparency:reduce)]:bg-slate-900/[0.06] [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none',
        ]
      )}
    >
      <Icon
        className={clsx('size-6 transition-[color,transform] duration-100', tone)}
        strokeWidth={active ? 2.5 : 2}
      />
      {/* wayfinding dot — replaces the removed text label */}
      <span
        aria-hidden
        className={clsx(
          'absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity duration-150',
          active && !accent ? 'bg-slate-900 opacity-100' : 'opacity-0'
        )}
      />
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
          'pointer-events-auto relative isolate flex items-center gap-1.5 overflow-hidden rounded-[1.75rem] p-1.5',
          // frosted base — opacity floor kept high so icons stay legible over ANY
          // backdrop (incl. dark sections), like the iOS tab-bar material
          'bg-white/75 supports-[backdrop-filter]:bg-white/62',
          'backdrop-blur-2xl backdrop-saturate-[1.8] backdrop-brightness-[1.06]',
          // glass rim: bright inset top edge, faint inset bottom, hairline outer ring
          'ring-1 ring-white/50',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),inset_0_-1px_0_0_rgba(15,23,42,0.04),0_14px_46px_-12px_rgba(45,130,140,0.18),0_6px_16px_-8px_rgba(15,23,42,0.10)]',
          // reduced transparency → plain solid surface
          '[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none [@media(prefers-reduced-transparency:reduce)]:shadow-[0_8px_24px_-10px_rgba(15,23,42,0.18)]'
        )}
      >
        {/* glossy specular — soft light pooling top-left, muted pastel, no hard edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(130%_90%_at_18%_-10%,rgba(255,255,255,0.7),rgba(226,245,244,0.28)_38%,transparent_66%)] [@media(prefers-reduced-transparency:reduce)]:hidden"
        />
        {/* frosted micro-texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-overlay [@media(prefers-reduced-transparency:reduce)]:hidden"
          style={{ backgroundImage: GRAIN, backgroundSize: '120px 120px' }}
        />

        <NavItem href="/" label={t('home')} icon={Home} active={isHome} />
        <NavItem href="/journal" label={t('journal')} icon={BookOpen} active={isJournal} />
        <NavItem href="/#cases" label={t('cases')} icon={Briefcase} active={false} />
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
