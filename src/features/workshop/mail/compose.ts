import { createTranslator } from 'next-intl';
import messages from '../../../../messages/ru.json';
import { icsUid, WORKSHOP_LOCALE } from '@/config/workshop';
import type { TemplateId } from '../domain/emailPlan';
import { formatSessionDate } from '../format';
import { buildIcs } from '../ics';
import { renderEmailHtml, type EmailButton } from './layout';
import { failOnMissingMessage } from './strict';

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

const t = createTranslator({
  locale: WORKSHOP_LOCALE,
  messages,
  namespace: 'workshop',
  onError: failOnMissingMessage,
});

// Long tokenised URLs never appear as text: in HTML they sit behind labelled buttons,
// in the plain-text part each one follows its label on its own line.
function buttonsFor(ctx: EmailContext): EmailButton[] {
  const cta = (
    key: 'meeting' | 'feedback' | 'followup' | 'materials',
    url: string | null | undefined
  ): EmailButton[] => (url ? [{ label: t(`email.cta.${key}`), url }] : []);
  switch (ctx.template) {
    case 'confirmation':
    case 'reminder_24h':
    case 'reminder_1h':
    case 'rescheduled':
      return cta('meeting', ctx.meetingUrl);
    case 'post_attended':
      return [...cta('feedback', ctx.links.feedback), ...cta('materials', ctx.materialsUrl)];
    case 'post_missed':
      return cta('materials', ctx.materialsUrl);
    case 'followup':
      return cta('followup', ctx.links.followup);
  }
}

const asText = (b: EmailButton) => `${b.label}: ${b.url}`;

export function composeEmail(ctx: EmailContext): OutgoingMail {
  const vars = {
    name: ctx.fullName,
    title: ctx.sessionTitle,
    date: formatSessionDate(ctx.startsAt, t('timezoneLabel')),
  };
  const paragraphs = [
    t('email.greeting', vars),
    ...t(`email.${ctx.template}.body`, vars).split('\n\n'),
  ];
  const notes = ctx.includeAnnouncement ? [t('email.announcement')] : [];
  const buttons = buttonsFor(ctx);
  const signature = t('email.signature');
  const footer = {
    text: t('email.footer'),
    link: { label: t('email.footerLink'), url: ctx.links.manage },
  };

  const mail: OutgoingMail = {
    to: ctx.to,
    subject: t(`email.${ctx.template}.subject`, vars),
    text: [
      ...paragraphs,
      ...buttons.map(asText),
      ...notes,
      signature,
      `--\n${footer.text}\n${asText(footer.link)}`,
    ].join('\n\n'),
    html: renderEmailHtml({
      preheader: t(`email.${ctx.template}.preheader`, vars),
      paragraphs,
      buttons,
      notes,
      signature,
      footer,
    }),
    headers: { 'List-Unsubscribe': `<${ctx.links.manage}>` },
  };
  // The reschedule notice carries the calendar file too; a higher SEQUENCE makes calendars move
  // the existing event instead of adding a second one.
  if (ctx.template === 'confirmation' || ctx.template === 'rescheduled') {
    mail.attachments = [
      {
        filename: `${ctx.slug}.ics`,
        contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
        content: buildIcs({
          uid: icsUid(ctx.slug),
          title: ctx.sessionTitle,
          startsAt: ctx.startsAt,
          endsAt: ctx.endsAt,
          now: ctx.now,
          description: t('email.icsDescription', { meetingUrl: ctx.meetingUrl }),
          url: ctx.meetingUrl,
          sequence:
            ctx.template === 'rescheduled' ? Math.floor(ctx.now.getTime() / 1000) : undefined,
        }),
      },
    ];
  }
  return mail;
}
