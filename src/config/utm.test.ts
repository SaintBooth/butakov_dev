import { describe, expect, it } from 'vitest';
import { buildTrackedUrl } from './utm';

describe('buildTrackedUrl', () => {
  it('builds an absolute url with utm params', () => {
    expect(
      buildTrackedUrl({
        path: '/ru/journal/x',
        source: 'vcru',
        medium: 'article',
        campaign: 'case-x',
        content: 'footer',
      })
    ).toBe(
      'https://butakov.dev/ru/journal/x?utm_source=vcru&utm_medium=article&utm_campaign=case-x&utm_content=footer'
    );
  });

  it('keeps existing query and omits content when absent', () => {
    expect(
      buildTrackedUrl({ path: '/ru?a=1', source: 'telegram', medium: 'social', campaign: 'launch' })
    ).toBe('https://butakov.dev/ru?a=1&utm_source=telegram&utm_medium=social&utm_campaign=launch');
  });

  it('rejects a campaign that is not a slug', () => {
    expect(() =>
      buildTrackedUrl({ path: '/', source: 'email', medium: 'email', campaign: 'Big Launch' })
    ).toThrow();
  });
});
