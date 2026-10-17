import { describe, expect, it } from 'vitest';
import {
  feedbackReducer,
  initialFeedbackState,
  restoredFeedbackState,
  type FeedbackAction,
  type FeedbackState,
} from './feedbackReducer';

const run = (...actions: FeedbackAction[]): FeedbackState =>
  actions.reduce(feedbackReducer, initialFeedbackState);

describe('feedbackReducer', () => {
  it('starts untouched, so a saved vote can be shown instead', () => {
    expect(initialFeedbackState).toMatchObject({ phase: 'idle', touched: false });
  });

  it('yes: holds the pressed button, then thanks with animation', () => {
    expect(run({ type: 'vote_yes' })).toMatchObject({
      phase: 'yes_hold',
      choice: 'yes',
      touched: true,
    });
    expect(run({ type: 'vote_yes' }, { type: 'hold_done' })).toMatchObject({
      phase: 'thanks',
      choice: 'yes',
      animate: true,
    });
  });

  it('ignores hold_done outside the hold', () => {
    expect(run({ type: 'hold_done' })).toEqual(initialFeedbackState);
    expect(run({ type: 'vote_no' }, { type: 'hold_done' })).toMatchObject({ phase: 'no_open' });
  });

  it('rolls a failed yes back to an unanswered question with an error', () => {
    expect(run({ type: 'vote_yes' }, { type: 'hold_done' }, { type: 'failed' })).toMatchObject({
      phase: 'idle',
      choice: null,
      error: true,
      touched: true,
    });
  });

  it('no: opens the panel, sends, then thanks', () => {
    expect(run({ type: 'vote_no' })).toMatchObject({ phase: 'no_open', choice: 'no' });
    expect(run({ type: 'vote_no' }, { type: 'send' })).toMatchObject({
      sending: true,
      error: false,
    });
    expect(run({ type: 'vote_no' }, { type: 'send' }, { type: 'sent' })).toMatchObject({
      phase: 'thanks',
      choice: 'no',
      sending: false,
    });
  });

  it('keeps the panel open on a failed send, so the text survives', () => {
    expect(run({ type: 'vote_no' }, { type: 'send' }, { type: 'failed' })).toMatchObject({
      phase: 'no_open',
      sending: false,
      error: true,
    });
  });

  it('skip closes the panel into thanks', () => {
    expect(run({ type: 'vote_no' }, { type: 'skip' })).toMatchObject({
      phase: 'thanks',
      choice: 'no',
    });
  });

  it('ignores sent and skip outside the panel', () => {
    expect(run({ type: 'vote_yes' }, { type: 'sent' })).toMatchObject({ phase: 'yes_hold' });
    expect(run({ type: 'vote_yes' }, { type: 'skip' })).toMatchObject({ phase: 'yes_hold' });
  });

  it('change returns to the question with the previous answer pressed', () => {
    expect(
      run({ type: 'vote_no' }, { type: 'skip' }, { type: 'change', choice: 'no' })
    ).toMatchObject({
      phase: 'idle',
      choice: 'no',
      error: false,
    });
  });

  it('change from a restored vote marks the state as touched', () => {
    const s = feedbackReducer(restoredFeedbackState('yes'), { type: 'change', choice: 'yes' });
    expect(s).toMatchObject({ phase: 'idle', choice: 'yes', touched: true, animate: true });
  });
});

describe('restoredFeedbackState', () => {
  it('shows thanks without animation', () => {
    expect(restoredFeedbackState('no')).toMatchObject({
      phase: 'thanks',
      choice: 'no',
      animate: false,
    });
  });
});
