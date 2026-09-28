'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * One-shot reveal for `.scroll-reveal` sections. The previous scroll-linked CSS
 * animation (animation-timeline: view()) kept sections at opacity < 1 for the
 * whole time they scrolled in, which forced every backdrop-blur card inside to
 * re-render on each scroll frame. A short time-based transition pays that cost
 * once per section instead. Without JS nothing is hidden (see index.css).
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('.scroll-reveal:not(.is-revealed)')
    );

    // Already-visible sections are marked revealed before hiding is enabled,
    // so nothing on screen flashes out and back in after hydration.
    for (const el of sections) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-revealed');
    }
    root.classList.add('js-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    for (const el of sections) {
      if (!el.classList.contains('is-revealed')) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
