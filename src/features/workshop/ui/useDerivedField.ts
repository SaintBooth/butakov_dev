'use client';

import { useRef, useState } from 'react';

// A field that follows another until the person types their own value; clearing it hands it
// back to the automation. Used for the Latin name (a passport may spell it differently) and
// the English job title (the dictionary only knows common titles).
export function useDerivedField(derive: (source: string) => string, maxLength: number) {
  const [value, setValue] = useState('');
  const edited = useRef(false);
  return {
    value,
    onSourceChange(source: string) {
      if (!edited.current) setValue(derive(source).slice(0, maxLength));
    },
    onValueChange(next: string) {
      edited.current = next.trim() !== '';
      setValue(next);
    },
  };
}
