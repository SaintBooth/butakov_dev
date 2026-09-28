'use client';

import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { isLandingLocale, LANDING_IDS, landingPath } from '@/config/landings';
import { SERVICES_HREF } from '@/config/nav';
import { landings } from '@/data/landings';
import { getPriceHint } from '@/features/landing/priceHint';
import { Link, usePathname } from '@/i18n/navigation';

// iOS sheet curve; CSS transitions start from the current computed value, so a
// sheet grabbed mid-animation continues from where it is instead of jumping.
const SETTLE = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
const DRAG_SLOP = 8; // px of movement before a press becomes a drag (taps on links still work)
const DECELERATION = 0.998; // Apple's projection constant, scroll-like feel

const noop = () => () => {};

/** Where a flick would come to rest: exponential decay, as in Designing Fluid Interfaces. */
function project(velocity: number) {
  return ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);
}

/** Past the top bound the sheet resists progressively instead of hard-stopping. */
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}

interface ServicesSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function ServicesSheet({ open, onClose }: ServicesSheetProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    moved: false,
    startY: 0,
    samples: [] as Array<[number, number]>,
  });
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.style.transition = SETTLE;
    sheet.style.transform = open ? 'translateY(0)' : 'translateY(100%)';
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    sheet.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = {
      active: true,
      moved: false,
      startY: e.clientY,
      samples: [[e.clientY, e.timeStamp]],
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    if (!d.active || !sheet) return;
    const dy = e.clientY - d.startY;
    if (!d.moved) {
      if (Math.abs(dy) < DRAG_SLOP) return;
      d.moved = true;
      sheet.setPointerCapture(e.pointerId);
      sheet.style.transition = 'none';
    }
    d.samples = [...d.samples.slice(-4), [e.clientY, e.timeStamp]];
    const offset = dy < 0 ? rubberband(dy, sheet.offsetHeight) : dy;
    sheet.style.transform = `translateY(${offset}px)`;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const sheet = sheetRef.current;
    d.active = false;
    if (!d.moved || !sheet) return;
    const [y0, t0] = d.samples[0];
    const velocity = ((e.clientY - y0) / Math.max(e.timeStamp - t0, 1)) * 1000;
    const dy = Math.max(0, e.clientY - d.startY);
    sheet.style.transition = SETTLE;
    // Decide from where the gesture is heading, not where the finger let go.
    if (dy + project(velocity) > sheet.offsetHeight / 2) {
      onClose();
    } else {
      sheet.style.transform = 'translateY(0)';
    }
  };

  if (!mounted || !isLandingLocale(locale)) return null;

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-[95] bg-slate-900/40 transition-opacity duration-300 md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={open ? undefined : true}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // A drag that started on a link must not also navigate.
        onClickCapture={(e) => drag.current.moved && e.preventDefault()}
        style={{ transform: 'translateY(100%)' }}
        className="fixed inset-x-0 bottom-0 z-[100] touch-none select-none rounded-t-[1.75rem] bg-white px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_48px_-12px_rgba(15,23,42,0.35)] outline-none motion-reduce:!transition-none md:hidden"
      >
        <div aria-hidden className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />
        <h2 id={titleId} className="px-3 pb-2 text-lg font-bold text-slate-900">
          {t('services')}
        </h2>
        <ul>
          {LANDING_IDS.map((id) => {
            const { Icon } = landings[id];
            const hint = getPriceHint(id, locale);
            const current = pathname === landingPath(id, locale);
            return (
              <li key={id}>
                <Link
                  href={landingPath(id, locale)}
                  onClick={onClose}
                  aria-current={current ? 'page' : undefined}
                  className={clsx(
                    'flex min-h-14 items-center gap-3 rounded-2xl px-3 transition-colors duration-100 active:bg-slate-900/[0.06]',
                    current && 'bg-teal-50'
                  )}
                >
                  <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-slate-900">
                    {t(`landings.${id}`)}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {hint.monthly
                      ? t('pricePerMonth', { price: hint.price })
                      : t('priceFrom', { price: hint.price })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href={SERVICES_HREF}
          onClick={onClose}
          className="mt-1 flex min-h-12 items-center justify-between rounded-2xl px-3 text-sm font-bold text-teal-700 active:bg-teal-50"
        >
          {t('allServices')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </>,
    document.body
  );
}
