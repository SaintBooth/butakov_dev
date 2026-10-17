export type Choice = 'yes' | 'no';

export interface FeedbackState {
  phase: 'idle' | 'yes_hold' | 'no_open' | 'thanks';
  choice: Choice | null;
  sending: boolean;
  error: boolean;
  // Off for a vote restored from a past visit: animating what the reader did not just do misleads.
  animate: boolean;
  // Until the reader acts, the widget shows the vote saved on an earlier visit instead.
  touched: boolean;
}

export type FeedbackAction =
  | { type: 'vote_yes' }
  | { type: 'hold_done' }
  | { type: 'vote_no' }
  | { type: 'send' }
  | { type: 'sent' }
  | { type: 'settled' }
  | { type: 'skip' }
  | { type: 'failed' }
  | { type: 'change'; choice: Choice };

export const initialFeedbackState: FeedbackState = {
  phase: 'idle',
  choice: null,
  sending: false,
  error: false,
  animate: true,
  touched: false,
};

const fresh = { ...initialFeedbackState, touched: true };

export function restoredFeedbackState(choice: Choice): FeedbackState {
  return { ...initialFeedbackState, phase: 'thanks', choice, animate: false };
}

export function feedbackReducer(s: FeedbackState, a: FeedbackAction): FeedbackState {
  switch (a.type) {
    case 'vote_yes':
      return { ...fresh, phase: 'yes_hold', choice: 'yes' };
    case 'hold_done':
      return s.phase === 'yes_hold' ? { ...s, phase: 'thanks' } : s;
    case 'vote_no':
      return { ...fresh, phase: 'no_open', choice: 'no' };
    case 'send':
      return { ...s, sending: true, error: false };
    case 'sent':
    case 'skip':
      return s.phase === 'no_open' ? { ...s, phase: 'thanks', sending: false } : s;
    case 'settled':
      return { ...s, sending: false, error: false };
    case 'failed':
      return s.phase === 'no_open'
        ? { ...s, sending: false, error: true }
        : { ...fresh, error: true };
    case 'change':
      return { ...fresh, choice: a.choice };
  }
}
