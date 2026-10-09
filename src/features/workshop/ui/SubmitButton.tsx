'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-transform duration-100 active:scale-95 disabled:opacity-70 [@media(hover:hover)]:hover:bg-teal-500"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
