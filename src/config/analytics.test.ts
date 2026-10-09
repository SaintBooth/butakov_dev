import { describe, expect, it } from 'vitest';
import { isAnalyticsDisabledPath } from './analytics';
import { WORKSHOP_PATHS } from './workshop';

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

  it('blocks the path of every token URL the app builds', () => {
    for (const build of [WORKSHOP_PATHS.manage, WORKSHOP_PATHS.feedback, WORKSHOP_PATHS.followup]) {
      expect(isAnalyticsDisabledPath(new URL(build('x'), 'https://a.test').pathname)).toBe(true);
    }
  });
});
