import { describe, expect, it } from 'vitest';
import { icsUid } from './workshop';

describe('icsUid', () => {
  it('uses the site host, not a hardcoded domain', () => {
    expect(icsUid('ai-oct')).toBe('ai-oct@butakov.dev');
  });
});
