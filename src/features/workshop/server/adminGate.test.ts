import { describe, expect, it } from 'vitest';
import { createAdminGate } from './adminGate';

const TOKEN = 't'.repeat(32);

describe('createAdminGate', () => {
  it('accepts the bearer token and rejects anything else', () => {
    const check = createAdminGate({ max: 100, windowMs: 1000 });
    expect(check(`Bearer ${TOKEN}`, TOKEN, '1.1.1.1')).toBe('ok');
    expect(check('Bearer nope', TOKEN, '1.1.1.1')).toBe('unauthorized');
    expect(check(null, TOKEN, '1.1.1.1')).toBe('unauthorized');
    expect(check(TOKEN, TOKEN, '1.1.1.1')).toBe('unauthorized');
  });

  it('answers limited once an ip is over budget, even with the right token', () => {
    const check = createAdminGate({ max: 2, windowMs: 60_000 });
    expect(check('Bearer x', TOKEN, '2.2.2.2')).toBe('unauthorized');
    expect(check('Bearer x', TOKEN, '2.2.2.2')).toBe('unauthorized');
    expect(check(`Bearer ${TOKEN}`, TOKEN, '2.2.2.2')).toBe('limited');
    expect(check(`Bearer ${TOKEN}`, TOKEN, '3.3.3.3')).toBe('ok');
  });

  it('does not count the correct token, so the owner is never locked out by it', () => {
    const check = createAdminGate({ max: 2, windowMs: 60_000 });
    for (let i = 0; i < 10; i++) expect(check(`Bearer ${TOKEN}`, TOKEN, '4.4.4.4')).toBe('ok');
  });

  it('keeps failures of one address from limiting another', () => {
    const check = createAdminGate({ max: 2, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) check('Bearer x', TOKEN, '5.5.5.5');
    expect(check('Bearer x', TOKEN, '5.5.5.5')).toBe('limited');
    expect(check(`Bearer ${TOKEN}`, TOKEN, '6.6.6.6')).toBe('ok');
  });
});
