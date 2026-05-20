import { useRef } from 'react';

interface UseSliderResult {
  ref: React.RefObject<HTMLDivElement | null>;
  scroll: (dir: 'left' | 'right') => void;
}

export function useSlider(): UseSliderResult {
  const ref = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'left' | 'right'): void => {
    if (!ref.current) return;
    const amount = window.innerWidth > 1024 ? 480 : 432;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return { ref, scroll };
}
