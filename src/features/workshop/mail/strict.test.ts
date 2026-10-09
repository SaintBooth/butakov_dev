import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { failOnMissingMessage } from './strict';

const t = createTranslator({
  locale: 'ru',
  messages: { a: 'Привет, {name}' },
  onError: failOnMissingMessage,
});

// next-intl types keys and values from the messages, which would reject the bad calls below.
const lookup = t as unknown as (key: string, values?: object) => string;

describe('failOnMissingMessage', () => {
  it('lets a complete message through', () => {
    expect(lookup('a', { name: 'Иван' })).toBe('Привет, Иван');
  });

  it('throws for a missing message instead of returning the key', () => {
    expect(() => lookup('b')).toThrow();
  });

  it('throws when a placeholder value is missing', () => {
    expect(() => lookup('a')).toThrow();
  });
});
