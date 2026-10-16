import { describe, expect, it } from 'vitest';
import { landingForTags } from './journalLandings';

describe('landingForTags', () => {
  it('sends Bitrix and WordPress maintenance cases to support', () => {
    expect(landingForTags(['PHP 8', 'Bitrix', 'Refactoring'])).toBe('support');
    expect(landingForTags(['WordPress', 'PHP 8.3', 'MySQL'])).toBe('support');
  });

  it('prefers the store build over generic WordPress', () => {
    expect(landingForTags(['WordPress', 'WooCommerce', '1C', 'Claude Code'])).toBe('web-dev');
  });

  it('maps frontend app cases to web apps', () => {
    expect(landingForTags(['React', 'Vite', 'Nginx'])).toBe('web-apps');
  });

  it('returns null when nothing matches', () => {
    expect(landingForTags(['Opinion'])).toBeNull();
  });
});
