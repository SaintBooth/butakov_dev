'use client';

import { useId, useRef, type TransitionEvent } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';

interface Props {
  open: boolean;
  focusOnOpen: boolean;
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function FeedbackCommentPanel({
  open,
  focusOnOpen,
  value,
  sending,
  onChange,
  onSubmit,
  onSkip,
}: Props) {
  const t = useTranslations('journalFeedback');
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Acting at the start of the reveal would target a still collapsed panel; wait until it is in place.
  function onRevealed(e: TransitionEvent<HTMLDivElement>) {
    if (!open || e.target !== e.currentTarget || e.propertyName !== 'opacity') return;
    if (focusOnOpen) textareaRef.current?.focus({ preventScroll: true });
    textareaRef.current?.scrollIntoView({ block: 'nearest' });
  }

  return (
    <div
      inert={!open}
      onTransitionEnd={onRevealed}
      className={clsx(
        'grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--card-ease-out)]',
        'motion-reduce:transition-opacity',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <form
          className="flex flex-col gap-3 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor={id} className="text-sm font-semibold text-slate-700">
            {t('commentLabel')}
          </label>
          <textarea
            ref={textareaRef}
            id={id}
            rows={2}
            maxLength={JOURNAL_FEEDBACK.commentMaxLength}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('commentPlaceholder')}
            className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              aria-disabled={sending || value.trim() === ''}
              className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-[background-color,transform] duration-[var(--dur-press)] hover:bg-teal-500 active:scale-[0.97] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:active:scale-100"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="h-11 px-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
            >
              {t('skip')}
            </button>
            {value.length >= JOURNAL_FEEDBACK.commentCounterFrom && (
              <span className="ml-auto text-xs tabular-nums text-slate-400">
                {value.length}/{JOURNAL_FEEDBACK.commentMaxLength}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
