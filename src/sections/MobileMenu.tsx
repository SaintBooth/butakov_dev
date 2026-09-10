'use client';

import { clsx } from 'clsx';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CTA_HREF, NAV_ITEMS } from '@/config/nav';
import { Link, usePathname } from '@/i18n/navigation';

export default function MobileMenu() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Esc to close + lock body scroll while open; restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      buttonRef.current?.focus();
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('menu')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className={clsx(
          'flex size-11 items-center justify-center rounded-full text-slate-700',
          'ring-1 ring-slate-200/80 bg-white/60 backdrop-blur-md shadow-sm',
          'transition-transform duration-100 active:scale-95',
          '[@media(hover:hover)]:hover:text-slate-900'
        )}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* scrim */}
      <div
        aria-hidden
        onClick={close}
        className={clsx(
          'fixed inset-0 z-[95] bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* anchored panel — grows from the button (top-right) */}
      <div
        ref={panelRef}
        id="mobile-menu-panel"
        role="menu"
        aria-label={t('ariaLabel')}
        tabIndex={-1}
        className={clsx(
          'fixed right-4 top-[4.25rem] z-[100] w-[min(20rem,calc(100vw-2rem))] origin-top-right outline-none',
          'rounded-3xl p-2',
          'bg-white/85 supports-[backdrop-filter]:bg-white/75 backdrop-blur-2xl backdrop-saturate-[1.8]',
          'ring-1 ring-white/60 shadow-[0_20px_60px_-16px_rgba(15,23,42,0.28),inset_0_1px_0_0_rgba(255,255,255,0.7)]',
          'transition-[opacity,transform] duration-200 ease-out',
          'motion-reduce:transition-opacity',
          '[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0 motion-reduce:scale-100'
        )}
      >
        <ul className="flex flex-col">
          {NAV_ITEMS.map(({ key, href }) => {
            // journal is the only real route here; anchor items share pathname "/"
            const active = key === 'journal' && pathname.startsWith('/journal');
            return (
              <li key={key}>
                <Link
                  href={href}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  onClick={close}
                  className={clsx(
                    // radius 16px = panel 24px - padding 8px → corners stay concentric,
                    // fill inset from the panel edge equals the panel padding
                    'flex min-h-12 items-center rounded-2xl px-4 text-[15px] font-semibold',
                    'transition-colors duration-100 active:bg-slate-900/[0.06]',
                    active
                      ? 'bg-slate-900/[0.06] text-slate-900 ring-1 ring-black/[0.04]'
                      : 'text-slate-700 [@media(hover:hover)]:hover:bg-slate-900/[0.04] [@media(hover:hover)]:hover:text-slate-900'
                  )}
                >
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-1.5 px-2 pb-1 pt-2">
          <Link
            href={CTA_HREF}
            role="menuitem"
            onClick={close}
            className={clsx(
              'group flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-4',
              'text-[15px] font-bold text-white shadow-lg shadow-slate-900/15',
              'transition-transform duration-100 active:scale-95',
              '[@media(hover:hover)]:hover:bg-teal-500'
            )}
          >
            {t('cta')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
