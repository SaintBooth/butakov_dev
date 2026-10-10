import { describe, expect, it } from 'vitest';
import { composeEmail, type EmailContext } from './compose';

const manage = 'https://butakov.dev/ru/workshop/manage?t=m';

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
  links: { manage },
  now: new Date('2026-10-09T10:00:00Z'),
};

describe('composeEmail', () => {
  it('builds the confirmation with a meeting button, ics and unsubscribe header', () => {
    const m = composeEmail(base);
    expect(m.subject).toBe('Вы зарегистрированы: ИИ в бизнесе');
    expect(m.text).toContain('15:00');
    expect(m.text).toContain('Подключиться к встрече: https://telemost.yandex.ru/j/1');
    expect(m.text).toContain(`Отменить участие или отписаться: ${manage}`);
    expect(m.headers['List-Unsubscribe']).toBe(`<${manage}>`);
    expect(m.html).toContain('Иван &lt;b&gt;');
    expect(m.html).toMatch(
      /href="https:\/\/telemost\.yandex\.ru\/j\/1"[^>]*>Подключиться к встрече</
    );
    expect(m.attachments?.[0].filename).toBe('ai-oct.ics');
    // RFC 5545 folds long lines, so compare the unfolded content.
    const ics = m.attachments?.[0].content.replace(/\r\n /g, '');
    expect(ics).toContain('DESCRIPTION:Ссылка на встречу: https://telemost.yandex.ru/j/1');
  });

  it('hides tokenised links behind labels in the html part', () => {
    const m = composeEmail(base);
    expect(m.html).toMatch(
      /href="https:\/\/butakov\.dev\/ru\/workshop\/manage\?t=m"[^>]*>Отменить участие/
    );
    expect(m.html).not.toContain(`>${manage}<`);
  });

  it('adds materials and the announcement only where they belong', () => {
    const missed = composeEmail({
      ...base,
      template: 'post_missed',
      includeAnnouncement: true,
      materialsUrl: 'https://disk.yandex.ru/x',
    });
    expect(missed.text).toContain('Открыть материалы: https://disk.yandex.ru/x');
    expect(missed.text).toContain('О следующей сессии напишу');
    const quiet = composeEmail({ ...base, template: 'post_missed', includeAnnouncement: false });
    expect(quiet.text).not.toContain('О следующей сессии');
    expect(quiet.text).not.toContain('Открыть материалы');
    expect(quiet.attachments).toBeUndefined();
  });

  it('puts the feedback button into the post-session email', () => {
    const m = composeEmail({
      ...base,
      template: 'post_attended',
      links: { ...base.links, feedback: 'https://butakov.dev/ru/workshop/feedback?t=f' },
    });
    expect(m.text).toContain('Оставить отзыв: https://butakov.dev/ru/workshop/feedback?t=f');
    expect(m.html).toContain('href="https://butakov.dev/ru/workshop/feedback?t=f"');
  });

  it('never turns text from the participant into a link', () => {
    const m = composeEmail({ ...base, fullName: 'Иван https://evil.example/x' });
    expect(m.html).not.toContain('href="https://evil.example');
    expect(m.html).toContain('Иван https://evil.example/x');
  });
});
