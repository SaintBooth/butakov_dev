'use client';

import { useState } from 'react';
import PrivacyModal from '@/sections/PrivacyModal';

interface PrivacyModalTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function PrivacyModalTrigger({ children, className }: PrivacyModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          className ??
          'text-slate-400 hover:text-teal-400 text-sm transition-colors w-fit text-left'
        }
      >
        {children}
      </button>
      {isOpen && <PrivacyModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
