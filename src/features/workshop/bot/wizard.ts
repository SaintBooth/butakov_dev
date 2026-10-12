import type { Sql } from 'postgres';
import { clearDialog } from '../db/botDialogs';
import { countActiveRegistrations } from '../db/registrations';
import {
  findSessionById,
  sessionCounts,
  updateSession,
  type WorkshopSession,
} from '../db/sessions';
import type { Dialog } from './dialog';
import { parseCapacity, parseDuration, parseHttpsUrl, parseStart, parseTitle } from './parse';
import * as v from './views';

// Everything a step needs, already bound to the current update's context.
export interface WizardCtx {
  db: Sql;
  ownerId: number;
  now: () => Date;
  reply: (view: v.View) => Promise<unknown>;
  fail: (e: v.BotError) => Promise<unknown>;
  save: (d: Dialog) => Promise<unknown>;
  menu: () => Promise<unknown>;
  card: (s: WorkshopSession) => Promise<v.View>;
}

type CreateDialog = Extract<Dialog, { kind: 'create' }>;
type EditDialog = Extract<Dialog, { kind: 'edit' }>;
type TimeDialog = Extract<Dialog, { kind: 'time' }>;

function previewOf(draft: CreateDialog['draft']): v.View {
  return v.createPreviewView({
    title: draft.title ?? '',
    startsAt: new Date(draft.startsAt ?? 0),
    durationMin: draft.durationMin ?? 0,
    meetingUrl: draft.meetingUrl ?? '',
    capacity: draft.capacity ?? 0,
  });
}

export function runStep(w: WizardCtx, d: Dialog, text: string) {
  if (d.kind === 'create') return createStep(w, d, text);
  if (d.kind === 'edit') return editStep(w, d, text);
  return timeStep(w, d, text);
}

async function createStep(w: WizardCtx, d: CreateDialog, text: string) {
  const draft = { ...d.draft };
  switch (d.step) {
    case 'title': {
      const r = parseTitle(text);
      if (!r.ok) return w.fail(r.error);
      await w.save({ kind: 'create', step: 'start', draft: { ...draft, title: r.value } });
      return w.reply(v.promptView('start'));
    }
    case 'start': {
      const r = parseStart(text, w.now());
      if (!r.ok) return w.fail(r.error);
      await w.save({
        kind: 'create',
        step: 'duration',
        draft: { ...draft, startsAt: r.value.toISOString() },
      });
      return w.reply(v.promptView('duration'));
    }
    case 'duration': {
      const r = parseDuration(text);
      if (!r.ok) return w.fail(r.error);
      await w.save({ kind: 'create', step: 'meeting', draft: { ...draft, durationMin: r.value } });
      return w.reply(v.promptView('meeting'));
    }
    case 'meeting': {
      const r = parseHttpsUrl(text);
      if (!r.ok) return w.fail(r.error);
      await w.save({ kind: 'create', step: 'capacity', draft: { ...draft, meetingUrl: r.value } });
      return w.reply(v.promptView('capacity'));
    }
    case 'capacity': {
      const r = parseCapacity(text);
      if (!r.ok) return w.fail(r.error);
      const next = { ...draft, capacity: r.value };
      await w.save({ kind: 'create', step: 'confirm', draft: next });
      return w.reply(previewOf(next));
    }
    case 'confirm':
      return w.reply(previewOf(draft));
  }
}

async function editStep(w: WizardCtx, d: EditDialog, text: string) {
  const s = await findSessionById(w.db, d.sessionId);
  if (!s) return w.menu();
  let patch;
  if (d.field === 'title') {
    const r = parseTitle(text);
    if (!r.ok) return w.fail(r.error);
    patch = { title: r.value };
  } else if (d.field === 'capacity') {
    const r = parseCapacity(text);
    if (!r.ok) return w.fail(r.error);
    const { registered } = await sessionCounts(w.db, s.id);
    if (r.value < registered) return w.fail('capacity_below');
    patch = { capacity: r.value };
  } else {
    const r = parseHttpsUrl(text);
    if (!r.ok) return w.fail(r.error);
    patch = d.field === 'meeting' ? { meetingUrl: r.value } : { materialsUrl: r.value };
  }
  await updateSession(w.db, s.id, patch);
  await clearDialog(w.db, w.ownerId);
  await w.reply(v.textView('saved'));
  return w.reply(await w.card({ ...s, ...patch }));
}

async function timeStep(w: WizardCtx, d: TimeDialog, text: string) {
  if (d.step === 'start') {
    const r = parseStart(text, w.now());
    if (!r.ok) return w.fail(r.error);
    await w.save({ ...d, step: 'duration', startsAt: r.value.toISOString() });
    return w.reply(v.promptView('duration'));
  }
  const s = await findSessionById(w.db, d.sessionId);
  if (!s || !d.startsAt) return w.menu();
  if (d.step === 'duration') {
    const r = parseDuration(text);
    if (!r.ok) return w.fail(r.error);
    await w.save({ ...d, step: 'confirm', durationMin: r.value });
  }
  // Typed text at `confirm` must not reschedule; only the button does.
  return w.reply(
    v.reschedulePreviewView(s, new Date(d.startsAt), await countActiveRegistrations(w.db, s.id))
  );
}
