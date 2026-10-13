import { describe, expect, it } from 'vitest';
import { filterUmamiPayload } from './umami';

const ORIGIN = 'https://butakov.dev';

describe('filterUmamiPayload', () => {
  it.each(['/', '/ru/journal/some-case', '/ru/workshop/ai-2026-10-31?utm_source=tg'])(
    'passes a regular page %s through',
    (url) => {
      const payload = { url, website: 'w' };
      expect(filterUmamiPayload(payload, ORIGIN)).toBe(payload);
    }
  );

  it.each([
    '/ru/workshop/manage?t=secret',
    `${ORIGIN}/ru/workshop/feedback?t=secret`,
    '/ru/workshop/ai-2026-10-31/admin',
  ])('drops a token or admin page %s', (url) => {
    expect(filterUmamiPayload({ url, website: 'w' }, ORIGIN)).toBeNull();
  });

  it('keeps payloads without a url, such as identify calls', () => {
    const payload = { website: 'w' };
    expect(filterUmamiPayload(payload, ORIGIN)).toBe(payload);
  });

  it('passes a missing payload through unchanged', () => {
    expect(filterUmamiPayload(null, ORIGIN)).toBeNull();
  });
});
