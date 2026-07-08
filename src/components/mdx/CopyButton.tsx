'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Скопировано' : 'Скопировать код'}
      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/90 border border-slate-200 text-xs font-semibold text-slate-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-teal-600 hover:border-teal-200 transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Скопировано' : 'Копировать'}
    </button>
  );
}
