import { describe, expect, it } from 'vitest';
import { createFeedbackInputSchema, feedbackResultSchema } from './feedbackSchema';

const VOTER = '0b6f3c1e-8f3a-4c2b-9a51-2d7e4f1c9a10';
const schema = createFeedbackInputSchema((locale) =>
  locale === 'ru' ? ['wp-incident'] : ['umami']
);
const vote = (extra: Record<string, unknown>) => ({ voterId: VOTER, ...extra });

describe('createFeedbackInputSchema', () => {
  it('accepts a known slug for its locale', () => {
    expect(
      schema.safeParse(vote({ slug: 'wp-incident', locale: 'ru', helpful: true })).success
    ).toBe(true);
  });

  it('rejects a slug from another locale', () => {
    expect(schema.safeParse(vote({ slug: 'umami', locale: 'ru', helpful: true })).success).toBe(
      false
    );
  });

  it('rejects an unknown locale', () => {
    expect(schema.safeParse(vote({ slug: 'umami', locale: 'de', helpful: true })).success).toBe(
      false
    );
  });

  it('rejects a malformed voter id', () => {
    const r = schema.safeParse({ slug: 'umami', locale: 'en', helpful: true, voterId: 'abc' });
    expect(r.success).toBe(false);
  });

  it('trims the comment and drops it when blank', () => {
    const blank = schema.parse(
      vote({ slug: 'umami', locale: 'en', helpful: false, comment: '   ' })
    );
    expect(blank.comment).toBeUndefined();
    const text = schema.parse(
      vote({ slug: 'umami', locale: 'en', helpful: false, comment: '  more code  ' })
    );
    expect(text.comment).toBe('more code');
  });

  it('rejects a comment over 500 chars', () => {
    const r = schema.safeParse(
      vote({ slug: 'umami', locale: 'en', helpful: false, comment: 'x'.repeat(501) })
    );
    expect(r.success).toBe(false);
  });

  it('rejects a comment on a positive vote', () => {
    const r = schema.safeParse(vote({ slug: 'umami', locale: 'en', helpful: true, comment: 'hi' }));
    expect(r.success).toBe(false);
  });

  it('rejects unknown keys', () => {
    const r = schema.safeParse(vote({ slug: 'umami', locale: 'en', helpful: true, extra: 1 }));
    expect(r.success).toBe(false);
  });
});

describe('feedbackResultSchema', () => {
  it('parses both branches and rejects anything else', () => {
    expect(feedbackResultSchema.parse({ ok: true })).toEqual({ ok: true });
    expect(feedbackResultSchema.parse({ ok: false, reason: 'rate_limited' }).ok).toBe(false);
    expect(feedbackResultSchema.safeParse({ ok: false, reason: 'nope' }).success).toBe(false);
  });
});
