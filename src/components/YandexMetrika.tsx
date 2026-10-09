'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { YM_ID, isAnalyticsDisabledPath } from '@/config/analytics';
import { readConsent } from '@/config/consent';

declare global {
  interface Window {
    ym: (
      id: number,
      action: string,
      target?: string | Record<string, unknown>,
      params?: Record<string, unknown>
    ) => void;
  }
}

const IDLE_TIMEOUT_MS = 3000;
const TAG_SRC = 'https://mc.yandex.ru/metrika/tag.js';

/** The official snippet's queue stub: calls made before tag.js arrives are replayed by it. */
function ensureQueue() {
  /* eslint-disable */
  const w = window as any;
  w.ym =
    w.ym ||
    function () {
      (w.ym.a = w.ym.a || []).push(arguments);
    };
  w.ym.l = 1 * (new Date() as unknown as number);
  /* eslint-enable */
}

function injectTag() {
  if ([...document.scripts].some((s) => s.src === TAG_SRC)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = TAG_SRC;
  document.head.appendChild(script);
}

export function YandexMetrika() {
  const pathname = usePathname();
  const disabled = isAnalyticsDisabledPath(pathname);
  const initialised = useRef(false);

  useEffect(() => {
    if (disabled || readConsent() === 'declined') return;
    if (!initialised.current) {
      initialised.current = true;
      ensureQueue();
      // defer: no automatic hit. Hits are sent below per route, so a client-side navigation
      // into a token page (which this component no longer renders for) is never recorded.
      window.ym(YM_ID, 'init', {
        defer: true,
        webvisor: true,
        clickmap: true,
        ecommerce: 'dataLayer',
        accurateTrackBounce: true,
        trackLinks: true,
      });
    }

    // tag.js is ~90 KB with ~200 ms of main-thread work; injecting it during
    // hydration showed up as long tasks/TBT in PageSpeed. Only the download is
    // deferred (after load + idle) — init and goals are queued above, so no
    // hit is lost; the timeout bounds the wait on busy pages.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(injectTag, { timeout: IDLE_TIMEOUT_MS });
      } else {
        timeoutId = setTimeout(injectTag, 0);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled || readConsent() === 'declined') return;
    window.ym(YM_ID, 'hit', window.location.pathname + window.location.search);
  }, [pathname, disabled]);

  if (disabled) return null;

  return (
    <noscript>
      <img
        src={`https://mc.yandex.ru/watch/${YM_ID}`}
        style={{ position: 'absolute', left: '-9999px' }}
        alt=""
      />
    </noscript>
  );
}
