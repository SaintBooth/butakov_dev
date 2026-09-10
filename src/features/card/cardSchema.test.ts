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

  it('rejects free-text contact with no phone/handle/link marker', () => {
    const r = schema.safeParse({ ...base, contact: 'связаться со мной' });
    expect(r.success).toBe(false);
  });

  it('accepts phone, @handle and t.me contact forms', () => {
    for (const contact of ['+7 912 000 00 00', '89120000000', '@ivan', 't.me/ivan']) {
      expect(schema.safeParse({ ...base, contact }).success).toBe(true);
    }
  });

  it('rejects website without a dot-TLD but accepts a domain', () => {
    expect(schema.safeParse({ ...base, website: 'мой сайт' }).success).toBe(false);
    expect(schema.safeParse({ ...base, website: 'https://shop.ru/x' }).success).toBe(true);
  });

  it('rejects name and contact over their max length', () => {
    expect(schema.safeParse({ ...base, name: 'и'.repeat(81) }).success).toBe(false);
    expect(schema.safeParse({ ...base, contact: '9'.repeat(121) }).success).toBe(false);
  });
});
