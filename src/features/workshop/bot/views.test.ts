import { describe, expect, it } from 'vitest';
import { cardView, initials, menuView, peopleView, promptView, summaryView } from './views';

const s = {
  id: 12,
  slug: 'ai-2026-10-31',
  title: 'ИИ в бизнесе',
  startsAt: new Date('2026-10-31T16:00:00Z'),
  endsAt: new Date('2026-10-31T18:00:00Z'),
  meetingUrl: 'https://telemost.yandex.ru/j/1',
  materialsUrl: null,
  checkinCode: 'AB3K9Z',
  capacity: 30,
  registrationOpen: true,
};
const data = (v: any) => v.keyboard.inline_keyboard.flat().map((b: any) => b.callback_data);

describe('initials', () => {
  it.each([
    ['Анна Кузнецова', 'Анна К.'],
    ['  Иван   Петров  Сидорович ', 'Иван П.'],
    ['Мадонна', 'Мадонна'],
  ])('%s → %s', (full, short) => expect(initials(full)).toBe(short));
});

describe('menuView', () => {
  it('lists sessions with seats and a button each, plus new/past', () => {
    const v = menuView([{ ...s, registered: 12 }]);
    expect(v.text).toContain('ИИ в бизнесе');
    expect(v.text).toContain('12/30');
    expect(data(v)).toEqual(['c:12', 'n', 'p']);
  });
});

describe('cardView', () => {
  it('shows links, code and counts, and offers to close registration', () => {
    const v = cardView(s, { registered: 12, cancelled: 2, attended: 0 });
    expect(v.text).toContain('/ru/workshop/ai-2026-10-31');
    expect(v.text).toContain('AB3K9Z');
    expect(data(v)).toEqual(['u:12:0', 'e:12', 't:12', 's:12', 'm']);
  });
});

describe('peopleView', () => {
  it('never shows a full surname or an email', () => {
    const v = peopleView(s, [{ fullName: 'Анна Кузнецова', status: 'attended' }], 0);
    expect(v.text).toContain('Анна К.');
    expect(v.text).not.toContain('Кузнецова');
    expect(v.text).not.toMatch(/@/);
    expect(data(v)).toContain('l:12');
  });
  it('pages by the configured size', () => {
    const many = Array.from({ length: 51 }, (_, i) => ({
      fullName: `Имя${i} Ф`,
      status: 'registered' as const,
    }));
    expect(data(peopleView(s, many, 0))).toContain('u:12:1');
    expect(peopleView(s, many, 1).text).toContain('Имя50 Ф.');
  });
});

describe('summaryView', () => {
  it('reports attendance percentage and the average', () => {
    const v = summaryView(s, {
      registered: 10,
      cancelled: 1,
      attended: 7,
      feedbackCount: 5,
      avgRecommend: 8.6,
      followupsSent: 0,
      followupsAnswered: 0,
    });
    expect(v.text).toContain('70%');
    expect(v.text).toContain('8.6');
  });
});

describe('promptView', () => {
  it('offers duration presets and cancel', () => {
    expect(data(promptView('duration'))).toEqual(['w:60', 'w:90', 'w:120', 'w:180', 'x']);
  });
});
