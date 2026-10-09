import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Notice({
  tone,
  children,
}: {
  tone: 'info' | 'success' | 'error';
  children: ReactNode;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'rounded-xl border px-4 py-3 text-sm',
        tone === 'info' && 'border-slate-200 bg-slate-50 text-slate-700',
        tone === 'success' && 'border-teal-200 bg-teal-50 text-teal-800',
        tone === 'error' && 'border-red-200 bg-red-50 text-red-700'
      )}
    >
      {children}
    </div>
  );
}
