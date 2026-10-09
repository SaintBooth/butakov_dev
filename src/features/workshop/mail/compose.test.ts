import { describe, expect, it } from 'vitest';
import { composeEmail, type EmailContext } from './compose';

const base: EmailContext = {
  template: 'confirmation',
  includeAnnouncement: false,
  to: 'ivan@x.ru',
  fullName: 'Иван <b>',
  slug: 'ai-oct',
  sessionTitle: 'ИИ в бизнесе',
  startsAt: new Date('2026-10-20T12:00:00Z'),
  endsAt: new Date('2026-10-20T14:00:00Z'),
  meetingUrl: 'https://telemost.yandex.ru/j/1',
  materialsUrl: null,
  links: { manage: 'https://butakov.dev/ru/workshop/manage?t=m' },
  now: new Date('2026-10-09T10:00:00Z'),
};

describe('composeEmail', () => {
  it('builds the confirmation with ics, unsubscribe header and escaped html', () => {
    const m = composeEmail(base);
    expect(m.subject).toBe('Вы зарегистрированы: ИИ в бизнесе');
    expect(m.text).toContain('15:00');
    expect(m.text).toContain('https://telemost.yandex.ru/j/1');
    expect(m.text).toContain('https://butakov.dev/ru/workshop/manage?t=m');
    expect(m.headers['List-Unsubscribe']).toBe('<https://butakov.dev/ru/workshop/manage?t=m>');
    expect(m.html).toContain('Иван &lt;b&gt;');
    expect(m.html).toContain('<a href="https://telemost.yandex.ru/j/1">');
    expect(m.attachments?.[0].filename).toBe('ai-oct.ics');
    // RFC 5545 folds long lines, so compare the unfolded content.
    const ics = m.attachments?.[0].content.replace(/\r\n /g, '');
    expect(ics).toContain('DESCRIPTION:Ссылка на встречу: https://telemost.yandex.ru/j/1');
  });

  it('adds materials and the announcement only where they belong', () => {
    const missed = composeEmail({
      ...base,
      template: 'post_missed',
      includeAnnouncement: true,
      materialsUrl: 'https://disk.yandex.ru/x',
    });
    expect(missed.text).toContain('Материалы: https://disk.yandex.ru/x');
    expect(missed.text).toContain('Следующую сессию анонсирую');
    const quiet = composeEmail({ ...base, template: 'post_missed', includeAnnouncement: false });
    expect(quiet.text).not.toContain('Следующую сессию');
    expect(quiet.attachments).toBeUndefined();
  });

  it('puts the feedback link into the post-session email', () => {
    const m = composeEmail({
      ...base,
      template: 'post_attended',
      links: { ...base.links, feedback: 'https://butakov.dev/ru/workshop/feedback?t=f' },
    });
    expect(m.text).toContain('https://butakov.dev/ru/workshop/feedback?t=f');
  });

  it('links only its own urls and keeps punctuation out of the href', () => {
    const m = composeEmail({
      ...base,
      fullName: 'Иван https://evil.example/x',
      links: { manage: 'https://butakov.dev/ru/workshop/manage?t=m' },
    });
    expect(m.html).not.toContain('<a href="https://evil.example');
    expect(m.html).toContain('Иван https://evil.example/x');
    expect(m.html).toContain('<a href="https://butakov.dev/ru/workshop/manage?t=m">');
    expect(m.html).not.toMatch(/href="[^"]*(&gt;|\.)"/);
  });
});
