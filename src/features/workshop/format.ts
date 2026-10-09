import { WORKSHOP_LOCALE, WORKSHOP_TIME_ZONE } from '@/config/workshop';

const formatter = new Intl.DateTimeFormat(WORKSHOP_LOCALE, {
  timeZone: WORKSHOP_TIME_ZONE,
  dateStyle: 'long',
  timeStyle: 'short',
});

export function formatSessionDate(d: Date, zoneLabel: string): string {
  return `${formatter.format(d)} (${zoneLabel})`;
}
