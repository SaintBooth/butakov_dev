import { describe, expect, it } from 'vitest';
import { articleUrl, formatFeedbackNotice } from './feedbackNotice';

describe('articleUrl', () => {
  it('has no prefix for the default locale', () => {
    expect(articleUrl('en', 'umami')).toBe('https://butakov.dev/journal/umami');
  });

  it('prefixes other locales', () => {
    expect(articleUrl('ru', 'umami')).toBe('https://butakov.dev/ru/journal/umami');
  });
});

describe('formatFeedbackNotice', () => {
  it('carries slug, url, the quoted comment and a user-text marker', () => {
    const text = formatFeedbackNotice({ locale: 'ru', slug: 'umami', comment: 'мало кода' });
    expect(text.split('\n')).toEqual([
      '📝 Отзыв «Нет» — umami',
      'https://butakov.dev/ru/journal/umami',
      '«мало кода»',
      '⚠️ пользовательский текст',
    ]);
  });
});
