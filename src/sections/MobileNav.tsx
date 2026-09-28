'use client';

import { clsx } from 'clsx';
import { BookOpen, Briefcase, LayoutGrid, MessageSquare, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState, type ReactNode } from 'react';
import { isNavActive, MOBILE_NAV_ITEMS } from '@/config/nav';
import { ContactTrigger } from '@/features/contact/ContactTrigger';
import { Link, usePathname } from '@/i18n/navigation';
import ServicesSheet from './ServicesSheet';

const ICONS: Record<string, LucideIcon> = {
  services: LayoutGrid,
  cases: Briefcase,
  journal: BookOpen,
  request: MessageSquare,
};

// Shared tab geometry: press feedback on pointer-down (:active), no layout shift.
const TAB_CLASS = clsx(
  'group relative z-10 flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl',
  'transition-transform duration-100 ease-out active:scale-95',
  'motion-reduce:transition-none motion-reduce:active:scale-100'
);

function TabContent({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <span
        className={clsx(
          'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150',
          active ? 'bg-teal-500/15' : 'group-active:bg-slate-900/[0.06]'
        )}
      >
        <Icon
          aria-hidden="true"
          className={clsx('size-[22px]', active ? 'text-teal-700' : 'text-slate-600')}
          strokeWidth={active ? 2.4 : 1.9}
        />
      </span>
      <span
        className={clsx(
          'text-[11px] leading-none tracking-[0.01em]',
          active ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'
        )}
      >
        {label}
      </span>
    </>
  );
}

export default function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const renderItem = (item: (typeof MOBILE_NAV_ITEMS)[number]): ReactNode => {
    const label = t(item.key);
    const icon = ICONS[item.key];
    const active =
      item.kind === 'sheet'
        ? sheetOpen || isNavActive(item.key, pathname, searchParams)
        : isNavActive(item.key, pathname, searchParams);

    if (item.kind === 'sheet') {
      return (
        <button
          key={item.key}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen((v) => !v)}
          className={TAB_CLASS}
        >
          <TabContent icon={icon} label={label} active={active} />
        </button>
      );
    }
    if (item.kind === 'contact') {
      // The primary action reads as a filled button, not as one more tab.
      const Icon = icon;
      return (
        <div key={item.key} className="flex flex-1 items-center justify-center px-0.5">
          <ContactTrigger className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-teal-500 text-[13px] font-bold text-white shadow-md shadow-teal-600/25 transition-transform duration-100 active:scale-95 motion-reduce:active:scale-100">
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </ContactTrigger>
        </div>
      );
    }
    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={TAB_CLASS}
      >
        <TabContent icon={icon} label={label} active={active} />
      </Link>
    );
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label={t('ariaLabel')}
        className={clsx(
          'pointer-events-auto relative isolate flex items-center gap-1 overflow-hidden rounded-2xl p-1',
          // frosted base — opacity floor kept high so labels stay legible over ANY
          // backdrop (incl. dark sections), like the iOS tab-bar material
          'bg-white/75 supports-[backdrop-filter]:bg-white/62',
          'backdrop-blur-xl backdrop-saturate-[1.8]',
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
        {MOBILE_NAV_ITEMS.map(renderItem)}
      </nav>
      <ServicesSheet open={sheetOpen} onClose={closeSheet} />
    </div>
  );
}
