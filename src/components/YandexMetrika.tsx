'use client';

import { useEffect } from 'react';
import { YM_ID } from '@/config/analytics';

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
  useEffect(() => {
    ensureQueue();
    window.ym(YM_ID, 'init', {
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      accurateTrackBounce: true,
      trackLinks: true,
    });

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
  }, []);

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
