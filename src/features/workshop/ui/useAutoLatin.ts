'use client';

import { useRef, useState } from 'react';
import { FIELD_LIMITS } from '@/config/workshop';
import { transliterateName } from '../domain/translit';

// The Latin name follows the Cyrillic one until the participant types their own spelling
// (a passport may differ from the standard); clearing the field hands it back to the automation.
export function useAutoLatin() {
  const [latin, setLatin] = useState('');
  const edited = useRef(false);
  return {
    latin,
    onNameChange(name: string) {
      if (!edited.current) setLatin(transliterateName(name).slice(0, FIELD_LIMITS.fullNameLatin));
    },
    onLatinChange(value: string) {
      edited.current = value.trim() !== '';
      setLatin(value);
    },
  };
}
