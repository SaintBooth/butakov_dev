import { clsx } from 'clsx';

// Webvisor must never record what people type into these forms.
export const PII_CLASS = 'ym-disable-keys ym-hide-content';

const inputBase =
  'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40';

export function inputClass(hasError: boolean): string {
  return clsx(
    inputBase,
    PII_CLASS,
    hasError ? 'border-red-400' : 'border-slate-200 focus:border-teal-400'
  );
}

export const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';
export const hintClass = 'mt-1 text-xs text-slate-500';
export const errorClass = 'mt-1 text-xs font-semibold text-red-500';
export const sectionTitleClass = 'text-lg font-extrabold tracking-tight text-slate-900';
export const choiceClass = `h-4 w-4 shrink-0 accent-teal-600 ${PII_CLASS}`;
