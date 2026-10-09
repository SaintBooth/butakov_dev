import { describe, expect, it } from 'vitest';
import { isAnalyticsDisabledPath } from './analytics';

describe('isAnalyticsDisabledPath', () => {
  it.each(['/ru/workshop/manage', '/ru/workshop/feedback', '/ru/workshop/followup/'])(
    'blocks token pages: %s',
    (path) => {
      expect(isAnalyticsDisabledPath(path)).toBe(true);
    }
  );

  it.each([
    '/',
    '/ru',
    '/ru/workshop/ai-test',
    '/ru/workshop/ai-test/checkin',
    '/ru/workshop/manage/x',
  ])('keeps analytics on other pages: %s', (path) => {
    expect(isAnalyticsDisabledPath(path)).toBe(false);
  });
});
