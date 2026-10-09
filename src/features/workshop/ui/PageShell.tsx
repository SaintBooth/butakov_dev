import type { ReactNode } from 'react';

export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-16 pt-28 sm:px-6">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </main>
  );
}
