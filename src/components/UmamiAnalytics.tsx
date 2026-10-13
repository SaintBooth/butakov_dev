'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { UMAMI, isAnalyticsDisabledPath } from '@/config/analytics';
import { readConsent } from '@/config/consent';
import { filterUmamiPayload } from '@/utils/umami';

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
    [UMAMI.beforeSendHook]?: (
      type: string,
      payload: { url?: string } | null
    ) => { url?: string } | null;
  }
}

const IDLE_TIMEOUT_MS = 3000;

function injectScript(path: string, attributes: Record<string, string>) {
  const src = `${UMAMI.origin}${path}`;
  if ([...document.scripts].some((s) => s.src === src)) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  for (const [name, value] of Object.entries(attributes)) script.setAttribute(name, value);
  document.head.appendChild(script);
}

function injectTrackers() {
  window[UMAMI.beforeSendHook] = (_type, payload) =>
    filterUmamiPayload(payload, window.location.origin);
  const site = { 'data-website-id': UMAMI.websiteId };
  injectScript(UMAMI.scriptPath, {
    ...site,
    'data-domains': UMAMI.domain,
    'data-before-send': UMAMI.beforeSendHook,
    'data-performance': 'true',
  });
  // Waits for the tracker's session on its own, so load order between the two does not matter.
  injectScript(UMAMI.recorderPath, site);
}

export function UmamiAnalytics() {
  const pathname = usePathname();
  const disabled = isAnalyticsDisabledPath(pathname);
  const loaded = useRef(false);

  useEffect(() => {
    if (disabled) {
      // recorder.js has no stop API and would keep capturing the page; a reload leaves the
      // session and renders this page without the trackers. These pages are not linked from
      // the site, so this only happens on an unusual client-side navigation.
      if (loaded.current) window.location.reload();
      return;
    }
    if (loaded.current || !UMAMI.websiteId || readConsent() === 'declined') return;

    const load = () => {
      loaded.current = true;
      injectTrackers();
    };

    // Same deferral as Metrika: the recorder (rrweb) is heavy, keep it out of hydration.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(load, { timeout: IDLE_TIMEOUT_MS });
      } else {
        timeoutId = setTimeout(load, 0);
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

  return null;
}
