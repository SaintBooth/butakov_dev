'use client';

import type { Ref } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { Choice } from './feedbackReducer';

interface Props {
  ref: Ref<HTMLParagraphElement>;
  visible: boolean;
  animate: boolean;
  choice: Choice | null;
  hasRelated: boolean;
  onChange: () => void;
}

export function FeedbackStatus({ ref, visible, animate, choice, hasRelated, onChange }: Props) {
  const t = useTranslations('journalFeedback');

  return (
    <p
      ref={ref}
      tabIndex={-1}
      aria-live="polite"
      className={clsx(
        'absolute inset-x-0 top-0 flex min-h-11 flex-wrap items-center gap-x-2 text-sm font-semibold text-slate-700 outline-none',
        animate && 'transition-opacity duration-[var(--dur-fast)]',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {visible && (
        <>
          <Check
            aria-hidden
            strokeDasharray={24}
            className={clsx(
              'size-4 text-teal-600',
              animate && 'motion-safe:animate-feedback-check'
            )}
          />
          <span>{choice === 'no' ? t('thanksNo') : t('thanks')}</span>
          {choice === 'yes' && hasRelated && (
            <span className="font-normal text-slate-500">{t('thanksMore')}</span>
          )}
          <button
            type="button"
            onClick={onChange}
            className="text-xs font-normal text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-600"
          >
            {t('change')}
          </button>
        </>
      )}
    </p>
  );
}
