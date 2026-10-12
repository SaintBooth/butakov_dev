import { InlineKeyboard } from 'grammy';
import { createTranslator } from 'next-intl';
import messages from '../../../../messages/ru.json';
import {
  absoluteUrl,
  BOT,
  WORKSHOP_LOCALE,
  WORKSHOP_PATHS,
  type RegistrationStatus,
} from '@/config/workshop';
import type {
  SessionCounts,
  SessionListItem,
  SessionSummary,
  WorkshopSession,
} from '../db/sessions';
import { formatSessionDate } from '../format';
import { failOnMissingMessage } from '../mail/strict';
import { EDIT_FIELDS, encode } from './callbacks';
import type { ParseError } from './parse';

export interface View {
  text: string;
  keyboard: InlineKeyboard;
}
export type PromptKey =
  | 'title'
  | 'start'
  | 'duration'
  | 'meeting'
  | 'capacity'
  | 'materials'
  | 'newTitle'
  | 'newMeeting'
  | 'newCapacity';
export type BotError = ParseError | 'capacity_below' | 'started' | 'generic';
type Person = { fullName: string; status: RegistrationStatus };

const t = createTranslator({
  locale: WORKSHOP_LOCALE,
  messages,
  namespace: 'workshop.bot',
  onError: failOnMissingMessage,
});
const tw = createTranslator({
  locale: WORKSHOP_LOCALE,
  messages,
  namespace: 'workshop',
  onError: failOnMissingMessage,
});
const when = (d: Date) => formatSessionDate(d, tw('timezoneLabel'));
const back = () => new InlineKeyboard().text(t('menu.back'), encode({ a: 'menu' }));
const lines = (title: string, rows: string[], empty: string) =>
  [title, ...(rows.length ? rows : [empty])].join('\n');

export function initials(fullName: string): string {
  const [first, second] = fullName.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

function listView(
  sessions: SessionListItem[],
  title: string,
  empty: string,
  withActions: boolean
): View {
  const kb = new InlineKeyboard();
  for (const s of sessions) kb.text(s.title, encode({ a: 'card', id: s.id })).row();
  if (withActions)
    kb.text(t('menu.new'), encode({ a: 'new' })).text(t('menu.past'), encode({ a: 'past' }));
  else kb.text(t('menu.back'), encode({ a: 'menu' }));
  const rows = sessions.map((s) =>
    t('menu.line', {
      title: s.title,
      date: when(s.startsAt),
      registered: s.registered,
      capacity: s.capacity,
      state: t(s.registrationOpen ? 'menu.open' : 'menu.closed'),
    })
  );
  return { text: lines(title, rows, empty), keyboard: kb };
}

export const menuView = (sessions: SessionListItem[]) =>
  listView(sessions, t('menu.title'), t('menu.empty'), true);
export const pastView = (sessions: SessionListItem[]) =>
  listView(sessions, t('past.title'), t('past.empty'), false);

export function cardView(s: WorkshopSession, c: SessionCounts): View {
  const text = [
    s.title,
    t('card.when', { date: when(s.startsAt) }),
    t('card.register', { url: absoluteUrl(WORKSHOP_PATHS.register(s.slug)) }),
    t('card.checkin', { url: absoluteUrl(WORKSHOP_PATHS.checkin(s.slug)) }),
    t('card.code', { code: s.checkinCode }),
    t('card.counts', { ...c, capacity: s.capacity }),
    ...(s.materialsUrl ? [t('card.materials', { url: s.materialsUrl })] : []),
  ].join('\n');
  const kb = new InlineKeyboard()
    .text(t('card.people'), encode({ a: 'people', id: s.id, page: 0 }))
    .text(t('card.edit'), encode({ a: 'edit', id: s.id }))
    .row()
    .text(t(s.registrationOpen ? 'card.close' : 'card.open'), encode({ a: 'toggle', id: s.id }))
    .text(t('card.summary'), encode({ a: 'summary', id: s.id }))
    .row()
    .text(t('menu.back'), encode({ a: 'menu' }));
  return { text, keyboard: kb };
}

export function peopleView(s: WorkshopSession, people: Person[], page: number): View {
  const size = BOT.participantsPageSize;
  const slice = people.slice(page * size, (page + 1) * size);
  const kb = new InlineKeyboard();
  if (page > 0) kb.text(t('people.prev'), encode({ a: 'people', id: s.id, page: page - 1 }));
  if ((page + 1) * size < people.length)
    kb.text(t('people.next'), encode({ a: 'people', id: s.id, page: page + 1 }));
  kb.row()
    .text(t('people.full'), encode({ a: 'link', id: s.id }))
    .row()
    .text(t('menu.back'), encode({ a: 'card', id: s.id }));
  const rows = slice.map((p) =>
    t('people.line', { name: initials(p.fullName), status: t(`people.status.${p.status}`) })
  );
  return {
    text: lines(t('people.title', { title: s.title }), rows, t('people.empty')),
    keyboard: kb,
  };
}

export const linkView = (s: WorkshopSession, url: string): View => ({
  text: t('link', { url }),
  keyboard: new InlineKeyboard().text(t('menu.back'), encode({ a: 'card', id: s.id })),
});

export function editMenuView(s: WorkshopSession): View {
  const kb = new InlineKeyboard();
  for (const field of EDIT_FIELDS)
    kb.text(t(`edit.fields.${field}`), encode({ a: 'field', id: s.id, field })).row();
  kb.text(t('menu.back'), encode({ a: 'card', id: s.id }));
  return { text: t('edit.title', { title: s.title }), keyboard: kb };
}

export function summaryView(s: WorkshopSession, sum: SessionSummary): View {
  const rate = sum.registered ? Math.round((sum.attended / sum.registered) * 100) : 0;
  const avg = sum.avgRecommend === null ? '' : t('avg', { avg: sum.avgRecommend });
  return {
    text: t('summary', {
      title: s.title,
      registered: sum.registered,
      attended: sum.attended,
      rate,
      feedback: sum.feedbackCount,
      avg,
      answered: sum.followupsAnswered,
      sent: sum.followupsSent,
    }),
    keyboard: new InlineKeyboard().text(t('menu.back'), encode({ a: 'card', id: s.id })),
  };
}

const PRESETS: Partial<
  Record<PromptKey, { values: readonly number[]; label: (n: number) => string }>
> = {
  duration: { values: BOT.durationPresetsMin, label: (n) => t('minutes', { n }) },
  capacity: { values: BOT.capacityPresets, label: String },
  newCapacity: { values: BOT.capacityPresets, label: String },
};

export function promptView(key: PromptKey): View {
  const kb = new InlineKeyboard();
  const presets = PRESETS[key];
  if (presets) {
    for (const v of presets.values) kb.text(presets.label(v), encode({ a: 'pick', value: v }));
    kb.row();
  }
  kb.text(t('cancel'), encode({ a: 'cancel' }));
  return { text: t(`prompt.${key}`), keyboard: kb };
}

export function createPreviewView(d: {
  title: string;
  startsAt: Date;
  durationMin: number;
  meetingUrl: string;
  capacity: number;
}): View {
  return {
    text: t('preview', {
      title: d.title,
      date: when(d.startsAt),
      duration: d.durationMin,
      meeting: d.meetingUrl,
      capacity: d.capacity,
    }),
    keyboard: new InlineKeyboard()
      .text(t('create'), encode({ a: 'confirm' }))
      .text(t('fix'), encode({ a: 'fix' }))
      .row()
      .text(t('cancel'), encode({ a: 'cancel' })),
  };
}

export const createdView = (s: WorkshopSession): View => ({
  text: t('created', {
    register: absoluteUrl(WORKSHOP_PATHS.register(s.slug)),
    checkin: absoluteUrl(WORKSHOP_PATHS.checkin(s.slug)),
    code: s.checkinCode,
  }),
  keyboard: new InlineKeyboard()
    .text(t('open'), encode({ a: 'card', id: s.id }))
    .row()
    .text(t('menu.back'), encode({ a: 'menu' })),
});

export const reschedulePreviewView = (
  s: WorkshopSession,
  startsAt: Date,
  affected: number
): View => ({
  text: [
    t('reschedule.preview', { title: s.title, date: when(startsAt) }),
    t('reschedule.affected', { count: affected }),
  ].join('\n'),
  keyboard: new InlineKeyboard()
    .text(t('reschedule.confirm'), encode({ a: 'confirm' }))
    .row()
    .text(t('cancel'), encode({ a: 'cancel' })),
});

export const rescheduledView = (s: WorkshopSession, notified: number): View => ({
  text: t('reschedule.done', { count: notified }),
  keyboard: new InlineKeyboard().text(t('open'), encode({ a: 'card', id: s.id })),
});

export const textView = (key: 'cancelled' | 'saved'): View => ({ text: t(key), keyboard: back() });

export const errorText = (e: BotError): string => t(`error.${e}`);
