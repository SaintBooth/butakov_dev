'use client';
import { clsx } from 'clsx';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

export default function Modal({ onClose, children, className, labelledBy }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Lock page scroll so a touch-drag inside the dialog doesn't scroll the page behind it.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full max-h-[90dvh] overflow-y-auto no-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
