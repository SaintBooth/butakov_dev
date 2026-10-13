'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import type { TrackSpec } from './events';
import { track } from './track';

interface TrackSeenProps {
  spec: TrackSpec;
  children: ReactNode;
}

// TrackSpec is a correlated union; track()'s overloads cannot narrow it, so send through a loose alias.
const sendSpec = track as (event: TrackSpec['event'], data: TrackSpec['data']) => void;

/** Sends `spec` once, the first time the wrapped block enters the viewport. */
export function TrackSeen({ spec, children }: TrackSeenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const specKey = JSON.stringify(spec);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { event, data } = JSON.parse(specKey) as TrackSpec;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      sendSpec(event, data);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [specKey]);

  return <div ref={ref}>{children}</div>;
}
