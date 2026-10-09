import { createTranslator } from 'next-intl';
import messages from '../../../../messages/ru.json';
import { WORKSHOP_LOCALE } from '@/config/workshop';
import type { TemplateId } from '../domain/emailPlan';
import { formatSessionDate } from '../format';
import { buildIcs } from '../ics';

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
  attachments?: { filename: string; content: string; contentType: string }[];
}

export interface EmailContext {
  template: TemplateId;
  includeAnnouncement: boolean;
  to: string;
  fullName: string;
  slug: string;
  sessionTitle: string;
  startsAt: Date;
  endsAt: Date;
  meetingUrl: string;
  materialsUrl: string | null;
  links: { manage: string; feedback?: string; followup?: string };
  now: Date;
}

const t = createTranslator({ locale: WORKSHOP_LOCALE, messages, namespace: 'workshop' });
const URL_RE = /(https:\/\/[^\s<]+)/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toHtml(text: string): string {
  const paragraphs = text
    .split('\n\n')
    .map((p) => escapeHtml(p).replace(URL_RE, '<a href="$1">$1</a>').replace(/\n/g, '<br>'));
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">${paragraphs
    .map((p) => `<p>${p}</p>`)
    .join('')}</body></html>`;
}

export function composeEmail(ctx: EmailContext): OutgoingMail {
  const vars = {
    name: ctx.fullName,
    title: ctx.sessionTitle,
    date: formatSessionDate(ctx.startsAt, t('timezoneLabel')),
    meetingUrl: ctx.meetingUrl,
    feedbackUrl: ctx.links.feedback ?? '',
    followupUrl: ctx.links.followup ?? '',
  };
  const parts = [t('email.greeting', vars), t(`email.${ctx.template}.body`, vars)];
  const isPostSession = ctx.template === 'post_attended' || ctx.template === 'post_missed';
  if (isPostSession && ctx.materialsUrl)
    parts.push(t('email.materials', { url: ctx.materialsUrl }));
  if (ctx.includeAnnouncement) parts.push(t('email.announcement'));
  parts.push(t('email.signature'), `—\n${t('email.footer', { manageUrl: ctx.links.manage })}`);
  const text = parts.join('\n\n');

  const mail: OutgoingMail = {
    to: ctx.to,
    subject: t(`email.${ctx.template}.subject`, vars),
    text,
    html: toHtml(text),
    headers: { 'List-Unsubscribe': `<${ctx.links.manage}>` },
  };
  if (ctx.template === 'confirmation') {
    mail.attachments = [
      {
        filename: `${ctx.slug}.ics`,
        contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
        content: buildIcs({
          uid: `${ctx.slug}@butakov.dev`,
          title: ctx.sessionTitle,
          startsAt: ctx.startsAt,
          endsAt: ctx.endsAt,
          now: ctx.now,
          description: t('email.icsDescription', { meetingUrl: ctx.meetingUrl }),
          url: ctx.meetingUrl,
        }),
      },
    ];
  }
  return mail;
}
