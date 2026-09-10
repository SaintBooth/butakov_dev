'use client';

import { clsx } from 'clsx';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { CTA_HREF, isNavActive, NAV_ITEMS } from '@/config/nav';
import { Link, usePathname } from '@/i18n/navigation';

const noop = () => () => {};

export default function MobileMenu() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  // The overlay is portalled into <body>, which only exists on the client.
  // `false` on the server, `true` after hydration — so the first client render
  // matches the overlay-less SSR tree instead of tripping a hydration mismatch.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // While open: Esc closes, Tab is trapped inside the panel, body scroll locks,
  // and focus returns to the trigger on close.
  useEffect(() => {
    if (!open) return;

    const trigger = buttonRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open, close]);

  // The header carries a backdrop-filter, which makes it the containing block for
  // any `position: fixed` descendant — so the overlay is portalled to <body> to
  // stay anchored to the viewport, not the 56px header box.
  const overlay = (
    <>
      <div
        aria-hidden
        onClick={close}
        className={clsx(
          'fixed inset-0 z-[95] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
          '[@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <div
        ref={panelRef}
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        tabIndex={-1}
        inert={open ? undefined : true}
        className={clsx(
          'fixed right-4 top-[4.25rem] z-[100] w-[min(20rem,calc(100vw-2rem))] origin-top-right outline-none',
          'rounded-3xl p-2',
          'bg-white/90 supports-[backdrop-filter]:bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.8]',
          'ring-1 ring-black/[0.06]',
          'shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35),inset_0_1px_0_0_rgba(255,255,255,0.9)]',
          'transition-[opacity,transform] duration-200 ease-out',
          'motion-reduce:transition-opacity',
          '[@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0 motion-reduce:scale-100'
        )}
      >
        <div className="flex items-center justify-between pb-1 pl-4 pr-1 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {t('menu')}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t('close')}
            className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors duration-100 active:bg-slate-900/[0.06] [@media(hover:hover)]:hover:text-slate-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label={t('ariaLabel')}>
          <ul className="flex flex-col">
            {NAV_ITEMS.map(({ key, href }) => {
              const active = isNavActive(key, pathname, searchParams);
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={close}
                    className={clsx(
                      // radius 16 = panel 24 − padding 8 → corners stay concentric
                      'flex min-h-12 items-center rounded-2xl px-4 text-[15px] font-semibold',
                      'transition-colors duration-100 active:bg-slate-900/[0.08]',
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
        </nav>

        <div className="pt-2">
          <Link
            href={CTA_HREF}
            onClick={close}
            className={clsx(
              'group flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4',
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
    </>
  );

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('menu')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className={clsx(
          'flex size-11 items-center justify-center rounded-full text-slate-700',
          'bg-white/60 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-md',
          'transition-transform duration-100 active:scale-95',
          '[@media(hover:hover)]:hover:text-slate-900'
        )}
      >
        <Menu className="size-5" />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
