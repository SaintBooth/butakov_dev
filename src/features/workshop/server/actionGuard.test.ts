import { afterEach, describe, expect, it, vi } from 'vitest';
import { guardDb } from './actionGuard';

afterEach(() => vi.restoreAllMocks());

describe('guardDb', () => {
  it('passes the result through', async () => {
    expect(
      await guardDb(
        't',
        () => 'fallback',
        async () => 'ok'
      )
    ).toBe('ok');
  });

  it('returns the fallback and logs only the tag, class and code', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = Object.assign(new Error('duplicate key (email)=(ivan@x.ru)'), { code: '23505' });
    expect(
      await guardDb(
        'register',
        () => 'fallback',
        async () => {
          throw err;
        }
      )
    ).toBe('fallback');
    expect(log).toHaveBeenCalledWith('[workshop] register failed:', 'Error:23505');
    expect(JSON.stringify(log.mock.calls)).not.toContain('ivan@x.ru');
  });
});
