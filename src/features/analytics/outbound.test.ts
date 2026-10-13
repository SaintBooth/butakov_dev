import { describe, expect, it } from 'vitest';
import { classifyLink } from './outbound';

const SITE = 'butakov.dev';

describe('classifyLink', () => {
  it.each([
    ['https://t.me/SashaBooth', { kind: 'telegram', host: 't.me' }],
    ['mailto:hello@butakov.dev', { kind: 'email', host: 'mailto' }],
    ['tel:+79990000000', { kind: 'phone', host: 'tel' }],
    ['https://github.com/SaintBooth', { kind: 'github', host: 'github.com' }],
    ['https://www.promptspace.ru/x', { kind: 'promptspace', host: 'promptspace.ru' }],
    ['https://vc.ru/u/1', { kind: 'external', host: 'vc.ru' }],
    ['http://constructor/', { kind: 'external', host: 'constructor' }],
  ])('classifies %s', (href, expected) => {
    expect(classifyLink(href, SITE)).toEqual(expected);
  });

  it.each([
    '/ru/journal',
    '#pricing',
    'https://butakov.dev/ru',
    'https://stats.butakov.dev/x',
    'javascript:void(0)',
  ])('ignores internal or non-http link %s', (href) => {
    expect(classifyLink(href, SITE)).toBeNull();
  });
});
