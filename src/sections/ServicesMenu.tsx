'use client';

import { clsx } from 'clsx';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { isLandingLocale, LANDING_IDS, landingPath } from '@/config/landings';
import { SERVICES_HREF } from '@/config/nav';
import { landings } from '@/data/landings';
import { getPriceHint } from '@/features/landing/priceHint';
import { Link } from '@/i18n/navigation';

const canHover = () => window.matchMedia('(hover: hover)').matches;

interface ServicesMenuProps {
  active: boolean;
}

export default function ServicesMenu({ active }: ServicesMenuProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Esc and outside clicks close the menu; hover only opens it on devices that can hover.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (!isLandingLocale(locale)) return null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => canHover() && setOpen(true)}
      onMouseLeave={() => canHover() && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        // On hover devices mouseenter has already opened it, so a toggle here would close it instantly.
        onClick={() => setOpen((v) => (canHover() ? true : !v))}
        className={clsx(
          'flex items-center gap-1 text-sm font-semibold transition-colors hover:text-teal-600',
          active ? 'text-slate-900' : 'text-slate-600'
        )}
      >
        {t('services')}
        <ChevronDown
          className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {/* pt-3 bridges the gap to the button so the pointer can travel into the panel without closing it */}
      <div
        id={menuId}
        hidden={!open}
        className="absolute left-1/2 top-full -translate-x-1/2 pt-3 w-[22rem]"
      >
        <ul className="rounded-2xl bg-white/95 backdrop-blur-2xl p-2 ring-1 ring-black/[0.06] shadow-[0_24px_64px_-16px_rgba(15,23,42,0.30)]">
          {LANDING_IDS.map((id) => {
            const { Icon } = landings[id];
            const hint = getPriceHint(id, locale);
            return (
              <li key={id}>
                <Link
                  href={landingPath(id, locale)}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-teal-50/70"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900">
                      {t(`landings.${id}`)}
                    </span>
                    <span className="block text-xs font-semibold text-slate-500 tabular-nums">
                      {hint.monthly
                        ? t('pricePerMonth', { price: hint.price })
                        : t('priceFrom', { price: hint.price })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="mt-1 border-t border-slate-100 pt-1">
            <Link
              href={SERVICES_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-teal-700 hover:bg-teal-50/70"
            >
              {t('allServices')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
