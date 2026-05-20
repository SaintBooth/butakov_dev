import { useRef } from 'react';

export function useSlider() {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    const amount = window.innerWidth > 1024 ? 480 : 432;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return { ref, scroll };
}
