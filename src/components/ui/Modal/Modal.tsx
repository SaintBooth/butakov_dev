import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Modal({ onClose, children, className }: ModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div
        className={clsx(
          'relative w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
