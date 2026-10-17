'use client';

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type RefObject,
} from 'react';
import { JOURNAL_FEEDBACK } from '@/config/journalFeedback';
import { track } from '@/features/analytics/track';
import type { Locale } from '@/i18n/locales';
import { submitArticleFeedback } from '../actions/submitArticleFeedback';
import { feedbackResultSchema } from '../domain/feedbackSchema';
import {
  feedbackReducer,
  initialFeedbackState,
  restoredFeedbackState,
  type Choice,
} from './feedbackReducer';
import { getVoterId, readVote, safeLocalStorage, writeVote } from './voteStore';

type Request = { helpful: boolean; comment?: string };

export interface FeedbackRefs {
  yes: RefObject<HTMLButtonElement | null>;
  no: RefObject<HTMLButtonElement | null>;
  status: RefObject<HTMLParagraphElement | null>;
}

const noop = () => () => {};
function subscribeStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function highlightRelated() {
  const el = document.querySelector<HTMLElement>('[data-related-articles]');
  if (!el) return;
  const { top, bottom } = el.getBoundingClientRect();
  // A highlight nobody sees is noise: nudge only when the cards are on screen.
  if (bottom < 0 || top > window.innerHeight) return;
  el.dataset.highlight = 'true';
  window.setTimeout(() => delete el.dataset.highlight, JOURNAL_FEEDBACK.relatedHighlightMs);
}

// Refs come from the component: handing them back through the hook's result would make every
// field look like a ref read during render to the React compiler lint.
export function useArticleFeedback(
  slug: string,
  locale: Locale,
  hasRelated: boolean,
  refs: FeedbackRefs
) {
  const [state, dispatch] = useReducer(feedbackReducer, initialFeedbackState);
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
  const saved = useSyncExternalStore(
    subscribeStorage,
    () => readVote(safeLocalStorage(), slug),
    () => null
  );
  const view = state.touched || !saved ? state : restoredFeedbackState(saved);

  // Only the latest request may change the UI; an older one answering late is ignored.
  const seq = useRef(0);
  const lastRequest = useRef<Request | null>(null);
  const pointerType = useRef('mouse');
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const focusChoice = useRef<Choice | null>(null);

  useEffect(() => {
    if (view.phase !== 'yes_hold') return;
    const id = window.setTimeout(
      () => dispatch({ type: 'hold_done' }),
      JOURNAL_FEEDBACK.thanksHoldMs
    );
    return () => window.clearTimeout(id);
  }, [view.phase]);

  useEffect(() => {
    if (view.phase === 'thanks' && view.animate) {
      refs.status.current?.focus({ preventScroll: true });
      if (view.choice === 'yes' && hasRelated) highlightRelated();
    }
    if (view.phase === 'idle' && focusChoice.current) {
      (focusChoice.current === 'yes' ? refs.yes : refs.no).current?.focus();
      focusChoice.current = null;
    }
  }, [view.phase, view.animate, view.choice, hasRelated, refs]);

  async function submit(req: Request, onOk: () => void) {
    const id = ++seq.current;
    lastRequest.current = req;
    const storage = safeLocalStorage();
    let ok = false;
    try {
      const res = await submitArticleFeedback({
        slug,
        locale,
        voterId: getVoterId(storage),
        ...req,
      });
      const parsed = feedbackResultSchema.safeParse(res);
      ok = parsed.success && parsed.data.ok;
    } catch {
      ok = false;
    }
    if (id !== seq.current) return;
    if (!ok) return dispatch({ type: 'failed' });
    writeVote(storage, slug, req.helpful ? 'yes' : 'no');
    onOk();
  }

  const busy = !hydrated || view.phase === 'yes_hold' || view.sending;
  // After "change", picking the same answer again is not a new vote: no request, no event.
  const isRepeat = (choice: Choice) =>
    view.phase === 'idle' && view.choice === choice && !view.error;

  function voteYes() {
    if (busy) return;
    const repeat = isRepeat('yes');
    dispatch({ type: 'vote_yes' });
    if (!repeat)
      void submit({ helpful: true }, () => track('article_helpful', { slug, value: 'yes' }));
  }

  function voteNo(e: MouseEvent) {
    if (busy || view.phase === 'no_open') return;
    // detail === 0: activated from the keyboard. Touch readers may only have wanted to vote,
    // so the keyboard does not pop up unasked.
    setFocusOnOpen(e.detail === 0 || pointerType.current === 'mouse');
    const repeat = isRepeat('no');
    dispatch({ type: 'vote_no' });
    if (!repeat)
      void submit({ helpful: false }, () => track('article_helpful', { slug, value: 'no' }));
  }

  function sendComment(comment: string) {
    if (view.sending) return;
    dispatch({ type: 'send' });
    void submit({ helpful: false, comment }, () => {
      track('article_helpful_comment', { slug });
      dispatch({ type: 'sent' });
    });
  }

  function resendBareNo(then: 'settled' | 'skip') {
    dispatch({ type: 'send' });
    void submit({ helpful: false }, () => {
      track('article_helpful', { slug, value: 'no' });
      dispatch({ type: then });
    });
  }

  function skip() {
    // The click-time "no" never reached the server: it has to land before the panel closes.
    if (view.error) resendBareNo('skip');
    else dispatch({ type: 'skip' });
  }

  function retry(comment: string) {
    const req = lastRequest.current;
    if (!req) return;
    if (req.comment) sendComment(comment.trim() || req.comment);
    else if (req.helpful) voteYes();
    else resendBareNo('settled');
  }

  function change() {
    if (!view.choice) return;
    focusChoice.current = view.choice;
    dispatch({ type: 'change', choice: view.choice });
  }

  return {
    view,
    busy,
    focusOnOpen,
    rememberPointer: (type: string) => {
      pointerType.current = type;
    },
    voteYes,
    voteNo,
    sendComment,
    skip,
    retry,
    change,
  };
}
