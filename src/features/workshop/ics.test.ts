import { describe, expect, it } from 'vitest';
import { buildIcs } from './ics';

const event = {
  uid: 'ai-oct@butakov.dev',
  title: 'ИИ в бизнесе; практикум, часть 1',
  startsAt: new Date('2026-10-20T12:00:00Z'),
  endsAt: new Date('2026-10-20T14:00:00Z'),
  now: new Date('2026-10-09T08:30:00Z'),
};

describe('buildIcs', () => {
  it('emits UTC times and CRLF line endings', () => {
    const ics = buildIcs(event);
    expect(ics).toContain('DTSTART:20261020T120000Z\r\n');
    expect(ics).toContain('DTEND:20261020T140000Z\r\n');
    expect(ics).toContain('DTSTAMP:20261009T083000Z\r\n');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('escapes semicolons, commas and newlines in text', () => {
    const ics = buildIcs({ ...event, description: 'a\nb' });
    expect(ics).toContain('SUMMARY:ИИ в бизнесе\\; практикум\\, часть 1');
    expect(ics).toContain('DESCRIPTION:a\\nb');
  });

  it('folds lines longer than 75 octets without splitting a character', () => {
    const ics = buildIcs({ ...event, description: 'я'.repeat(100) });
    for (const line of ics.split('\r\n')) {
      expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    }
    expect(ics.replace(/\r\n /g, '')).toContain('я'.repeat(100));
  });
});
