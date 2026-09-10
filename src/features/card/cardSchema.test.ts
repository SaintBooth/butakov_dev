import { describe, it, expect } from 'vitest';
import { createCardSchema } from './cardSchema';

const t = (k: string) => k;
const schema = createCardSchema(t);

const base = { name: 'Иван', contact: '@ivan', direction: 'audit' as const };

describe('createCardSchema', () => {
  it('accepts a minimal valid audit payload', () => {
    expect(schema.safeParse(base).success).toBe(true);
  });

  it('accepts optional problem and website', () => {
    const r = schema.safeParse({ ...base, problem: 'сайт тормозит', website: 'shop.ru' });
    expect(r.success).toBe(true);
  });

  it('rejects a short name with the translated message', () => {
    const r = schema.safeParse({ ...base, name: 'И' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('errors.name');
  });

  it('rejects a short contact', () => {
    const r = schema.safeParse({ ...base, contact: 'x' });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown direction', () => {
    const r = schema.safeParse({ ...base, direction: 'other' });
    expect(r.success).toBe(false);
  });

  it('rejects problem over 500 chars', () => {
    const r = schema.safeParse({ ...base, problem: 'a'.repeat(501) });
    expect(r.success).toBe(false);
  });
});
