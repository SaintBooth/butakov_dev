import { Bot, type ApiClientOptions, type Context } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import type { Sql } from 'postgres';
import { absoluteUrl, BOT, MINUTE_MS, WORKSHOP_PATHS } from '@/config/workshop';
import { listAdminParticipants } from '../db/adminView';
import { clearDialog, loadDialog, saveDialog } from '../db/botDialogs';
import { rescheduleSession } from '../db/rescheduleJobs';
import {
  createSession,
  findSessionById,
  listPastSessions,
  listUpcomingSessions,
  sessionCounts,
  sessionSummary,
  updateSession,
  type WorkshopSession,
} from '../db/sessions';
import { issueViewLink } from '../db/viewLinks';
import { describeError } from '../server/describeError';
import { decode, type Action } from './callbacks';
import type { Dialog } from './dialog';
import { slugBase } from './parse';
import * as v from './views';
import { runStep, type WizardCtx } from './wizard';

export interface BotDeps {
  token: string;
  ownerId: number;
  db: Sql;
  now: () => Date;
  botInfo?: UserFromGetMe;
  // Lets tests replace the network underneath every transformer.
  client?: ApiClientOptions;
}

const PREVIEW_METHODS = new Set(['sendMessage', 'editMessageText']);
const EDIT_PROMPT = {
  title: 'newTitle',
  meeting: 'newMeeting',
  materials: 'materials',
  capacity: 'newCapacity',
} as const;

export function createWorkshopBot(deps: BotDeps): Bot {
  const { db, now, ownerId } = deps;
  const bot = new Bot(deps.token, { botInfo: deps.botInfo, client: deps.client });

  // Telegram fetches every URL in a message to build a preview; for the admin link that would
  // hand a bearer token and the page behind it to Telegram's crawler.
  bot.api.config.use((prev, method, payload, signal) => {
    if (PREVIEW_METHODS.has(method) && payload && !('link_preview_options' in payload)) {
      payload = { ...payload, link_preview_options: { is_disabled: true } } as typeof payload;
    }
    return prev(method, payload, signal);
  });

  // Strangers get silence: an answer would confirm the bot exists and is wired to something.
  bot.use(async (ctx, next) => {
    if (ctx.from?.id === ownerId) await next();
  });

  const reply = (ctx: Context, view: v.View) =>
    ctx.reply(view.text, { reply_markup: view.keyboard });
  const show = async (ctx: Context, view: v.View) => {
    if (ctx.callbackQuery?.message)
      await ctx.editMessageText(view.text, { reply_markup: view.keyboard });
    else await reply(ctx, view);
  };
  const menu = async (ctx: Context) =>
    reply(ctx, v.menuView(await listUpcomingSessions(db, now())));
  const card = async (s: WorkshopSession) => v.cardView(s, await sessionCounts(db, s.id));
  const save = (d: Dialog) => saveDialog(db, ownerId, d, now());
  const fail = (ctx: Context, e: v.BotError) => ctx.reply(v.errorText(e));
  const wizard = (ctx: Context): WizardCtx => ({
    db,
    ownerId,
    now,
    reply: (view) => reply(ctx, view),
    fail: (e) => fail(ctx, e),
    save,
    menu: () => menu(ctx),
    card,
  });
  const step = (ctx: Context, d: Dialog, text: string) => runStep(wizard(ctx), d, text);

  async function withSession(
    ctx: Context,
    id: number,
    fn: (s: WorkshopSession) => Promise<unknown>
  ) {
    const s = await findSessionById(db, id);
    if (s) await fn(s);
    else await menu(ctx);
  }

  async function restartCreate(ctx: Context) {
    await save({ kind: 'create', step: 'title', draft: {} });
    return reply(ctx, v.promptView('title'));
  }

  async function confirm(ctx: Context, d: Dialog) {
    if (d.kind === 'create' && d.step === 'confirm') {
      const { title, startsAt, durationMin, meetingUrl, capacity } = d.draft;
      if (!title || !startsAt || !durationMin || !meetingUrl || !capacity)
        return fail(ctx, 'generic');
      const start = new Date(startsAt);
      const s = await createSession(
        db,
        {
          title,
          startsAt: start,
          endsAt: new Date(start.getTime() + durationMin * MINUTE_MS),
          meetingUrl,
          capacity,
        },
        slugBase(start)
      );
      await clearDialog(db, ownerId);
      return reply(ctx, v.createdView(s));
    }
    if (d.kind === 'time' && d.step === 'confirm' && d.startsAt && d.durationMin) {
      const start = new Date(d.startsAt);
      const r = await rescheduleSession(
        db,
        d.sessionId,
        start,
        new Date(start.getTime() + d.durationMin * MINUTE_MS),
        now()
      );
      await clearDialog(db, ownerId);
      if (r.status === 'started') return fail(ctx, 'started');
      const s = await findSessionById(db, d.sessionId);
      return s && r.status === 'ok' ? reply(ctx, v.rescheduledView(s, r.notified)) : menu(ctx);
    }
    return menu(ctx);
  }

  async function onAction(ctx: Context, action: Action) {
    switch (action.a) {
      case 'menu':
        return show(ctx, v.menuView(await listUpcomingSessions(db, now())));
      case 'past':
        return show(ctx, v.pastView(await listPastSessions(db, now(), BOT.pastSessionsLimit)));
      case 'card':
        return withSession(ctx, action.id, async (s) => show(ctx, await card(s)));
      case 'edit':
        return withSession(ctx, action.id, (s) => show(ctx, v.editMenuView(s)));
      case 'summary':
        return withSession(ctx, action.id, async (s) =>
          show(ctx, v.summaryView(s, await sessionSummary(db, s.id)))
        );
      case 'toggle':
        return withSession(ctx, action.id, async (s) => {
          await updateSession(db, s.id, { registrationOpen: !s.registrationOpen });
          await show(ctx, await card({ ...s, registrationOpen: !s.registrationOpen }));
        });
      case 'people':
        return withSession(ctx, action.id, async (s) => {
          const people = (await listAdminParticipants(db, s.id)).map(({ fullName, status }) => ({
            fullName,
            status,
          }));
          await show(ctx, v.peopleView(s, people, action.page));
        });
      case 'link':
        return withSession(ctx, action.id, async (s) => {
          const token = await issueViewLink(db, s.id, now());
          await reply(ctx, v.linkView(s, absoluteUrl(WORKSHOP_PATHS.admin(s.slug, token))));
        });
      case 'new':
      case 'fix':
        return restartCreate(ctx);
      case 'field':
        if (action.field === 'time') {
          await save({ kind: 'time', sessionId: action.id, step: 'start' });
          return reply(ctx, v.promptView('start'));
        }
        await save({ kind: 'edit', sessionId: action.id, field: action.field });
        return reply(ctx, v.promptView(EDIT_PROMPT[action.field]));
      case 'cancel':
        await clearDialog(db, ownerId);
        return reply(ctx, v.textView('cancelled'));
      case 'pick':
      case 'confirm': {
        const dialog = await loadDialog(db, ownerId, now());
        if (!dialog) return menu(ctx);
        return action.a === 'pick' ? step(ctx, dialog, String(action.value)) : confirm(ctx, dialog);
      }
    }
  }

  bot.command(['start', 'menu', 'cancel'], async (ctx) => {
    await clearDialog(db, ownerId);
    await menu(ctx);
  });
  bot.on('callback_query:data', async (ctx) => {
    await ctx.answerCallbackQuery();
    const action = decode(ctx.callbackQuery.data);
    if (action) await onAction(ctx, action);
  });
  bot.on('message:text', async (ctx) => {
    const dialog = await loadDialog(db, ownerId, now());
    if (!dialog) return menu(ctx);
    await step(ctx, dialog, ctx.message.text);
  });

  bot.catch(async (err) => {
    console.error('[workshop-bot]', describeError(err.error));
    try {
      await err.ctx.reply(v.errorText('generic'));
    } catch {
      // Telegram itself may be what failed; nothing more to do.
    }
  });
  return bot;
}
