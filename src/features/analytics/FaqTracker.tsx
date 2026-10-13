'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { LandingId } from '@/config/landings';
import { track } from './track';

interface FaqTrackerProps {
  landing: LandingId;
  children: ReactNode;
}

/** `toggle` does not bubble, so it is caught in the capture phase; only opens are sent. */
export function FaqTracker({ landing, children }: FaqTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onToggle = (e: Event) => {
      const details = e.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      const q = [...root.querySelectorAll('details')].indexOf(details);
      if (q >= 0) track('faq_open', { landing, q });
    };
    root.addEventListener('toggle', onToggle, true);
    return () => root.removeEventListener('toggle', onToggle, true);
  }, [landing]);

  return <div ref={ref}>{children}</div>;
}
