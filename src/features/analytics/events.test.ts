import { describe, expect, it } from 'vitest';
import { ANALYTICS_EVENTS, EVENT_SCHEMAS } from './events';

describe('EVENT_SCHEMAS', () => {
  it('has a schema for every event', () => {
    for (const name of ANALYTICS_EVENTS) expect(EVENT_SCHEMAS[name]).toBeDefined();
  });

  it('keeps card event names unchanged for Metrika goals', () => {
    expect(ANALYTICS_EVENTS).toEqual(
      expect.arrayContaining([
        'card_visit',
        'card_path_audit',
        'card_path_ai',
        'card_vcard',
        'card_telegram',
        'card_lead',
      ])
    );
  });

  it('accepts valid lead_submit data', () => {
    const r = EVENT_SCHEMAS.lead_submit.safeParse({
      form: 'modal',
      service: 'ai',
      placement: 'hero',
    });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown placement', () => {
    expect(EVENT_SCHEMAS.lead_open.safeParse({ placement: 'footer' }).success).toBe(false);
  });

  it.each(['email', 'name', 'contact', 'phone', 'message'])('rejects PII key %s', (key) => {
    expect(EVENT_SCHEMAS.lead_submit.safeParse({ form: 'modal', [key]: 'x' }).success).toBe(false);
  });

  it('accepts only defined read depths', () => {
    const base = { slug: 's', kind: 'case' };
    expect(EVENT_SCHEMAS.read_depth.safeParse({ ...base, depth: 75 }).success).toBe(true);
    expect(EVENT_SCHEMAS.read_depth.safeParse({ ...base, depth: 60 }).success).toBe(false);
  });

  it('accepts empty data for no-payload events', () => {
    expect(EVENT_SCHEMAS.card_visit.safeParse({}).success).toBe(true);
  });

  it('takes an article vote without any reader text', () => {
    expect(EVENT_SCHEMAS.article_helpful.safeParse({ slug: 'umami', value: 'yes' }).success).toBe(
      true
    );
    expect(EVENT_SCHEMAS.article_helpful.safeParse({ slug: 'umami', value: 'meh' }).success).toBe(
      false
    );
    expect(
      EVENT_SCHEMAS.article_helpful_comment.safeParse({ slug: 'umami', comment: 'x' }).success
    ).toBe(false);
  });
});
