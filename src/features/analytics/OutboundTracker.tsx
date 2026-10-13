'use client';

import { useEffect } from 'react';
import { UMAMI } from '@/config/analytics';
import { classifyLink } from './outbound';
import { track } from './track';

/** One capture-phase listener for the whole document; never blocks or delays navigation. */
export function OutboundTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const link = classifyLink(anchor.getAttribute('href') ?? '', UMAMI.domain);
      if (link) track('outbound_click', { kind: link.kind, host: link.host });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
