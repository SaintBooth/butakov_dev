'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Locale } from '@/i18n/locales';
import type { Choice } from './feedbackReducer';
import { FeedbackCommentPanel } from './FeedbackCommentPanel';
import { FeedbackStatus } from './FeedbackStatus';
import { useArticleFeedback } from './useArticleFeedback';

interface Props {
  slug: string;
  locale: Locale;
  hasRelated: boolean;
}

const pill = (active: boolean, tone: Choice) =>
  clsx(
    'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold sm:flex-none',
    'transition-[background-color,border-color,color,transform] duration-[var(--dur-press)]',
    'active:scale-[0.97] aria-disabled:cursor-default motion-reduce:active:scale-100',
    !active && 'border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700',
    active && tone === 'yes' && 'border-teal-600 bg-teal-600 text-white',
    active && tone === 'no' && 'border-slate-900 bg-slate-900 text-white'
  );

export function ArticleFeedback({ slug, locale, hasRelated }: Props) {
  const t = useTranslations('journalFeedback');
  const questionId = useId();
  const [comment, setComment] = useState('');
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [refs] = useState(() => ({ yes: yesRef, no: noRef, status: statusRef }));
  const fb = useArticleFeedback(slug, locale, hasRelated, refs);
  const { view } = fb;
  const isThanks = view.phase === 'thanks';

  return (
    <div className="relative">
      <div className="relative min-h-11">
        <div
          role="group"
          aria-labelledby={questionId}
          className={clsx(
            'flex flex-col gap-3 transition-opacity duration-[var(--dur-fast)] sm:flex-row sm:items-center sm:justify-between',
            // invisible keeps the row's height, so swapping in the status line shifts nothing.
            isThanks && 'invisible opacity-0'
          )}
        >
          <p id={questionId} className="text-sm font-semibold text-slate-700">
            {t('question')}
          </p>
          <div className="flex gap-3">
            <button
              ref={yesRef}
              type="button"
              aria-pressed={view.choice === 'yes'}
              aria-disabled={fb.busy}
              onPointerDown={(e) => fb.rememberPointer(e.pointerType)}
              onClick={fb.voteYes}
              className={pill(view.choice === 'yes', 'yes')}
            >
              <ThumbsUp
                aria-hidden
                className={clsx(
                  'size-4',
                  view.phase === 'yes_hold' && view.animate && 'motion-safe:animate-feedback-pop'
                )}
              />
              {t('yes')}
            </button>
            <button
              ref={noRef}
              type="button"
              aria-pressed={view.choice === 'no'}
              aria-disabled={fb.busy || view.phase === 'no_open'}
              onPointerDown={(e) => fb.rememberPointer(e.pointerType)}
              onClick={fb.voteNo}
              className={pill(view.choice === 'no', 'no')}
            >
              <ThumbsDown aria-hidden className="size-4" />
              {t('no')}
            </button>
          </div>
        </div>

        <FeedbackStatus
          ref={statusRef}
          visible={isThanks}
          animate={view.animate}
          choice={view.choice}
          hasRelated={hasRelated}
          onChange={fb.change}
        />
      </div>

      <FeedbackCommentPanel
        open={view.phase === 'no_open'}
        focusOnOpen={fb.focusOnOpen}
        value={comment}
        sending={view.sending}
        onChange={setComment}
        onSubmit={() => {
          if (comment.trim()) fb.sendComment(comment.trim());
        }}
        onSkip={fb.skip}
      />

      {view.error && (
        // Out of flow, in the gap below the widget: an error arriving late must not shift the page.
        <p role="alert" className="absolute left-0 top-full pt-2 text-sm text-amber-700">
          {t('error')}{' '}
          <button
            type="button"
            onClick={() => fb.retry(comment)}
            className="font-semibold underline underline-offset-2"
          >
            {t('retry')}
          </button>
        </p>
      )}
    </div>
  );
}
