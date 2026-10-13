'use client';

import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';
import { READ_DEPTHS, type ArticleKind, type ReadDepth } from './events';
import { track } from './track';

const POSITION: Record<ReadDepth, string> = {
  25: 'top-1/4',
  50: 'top-1/2',
  75: 'top-3/4',
  100: 'bottom-0',
};

interface ReadDepthTrackerProps {
  slug: string;
  kind: ArticleKind;
}

/** Invisible sentinels at 25/50/75/100% of the parent; each depth is sent once per page view. */
export function ReadDepthTracker({ slug, kind }: ReadDepthTrackerProps) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        const depth = Number((entry.target as HTMLElement).dataset.depth) as ReadDepth;
        track('read_depth', { slug, kind, depth });
      }
    });
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [slug, kind]);

  return (
    <>
      {READ_DEPTHS.map((depth, i) => (
        <div
          key={depth}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-depth={depth}
          aria-hidden="true"
          className={clsx('pointer-events-none absolute left-0 h-px w-px', POSITION[depth])}
        />
      ))}
    </>
  );
}
