import { describe, expect, it } from 'vitest';
import { rescheduleJobs } from './reschedule';

const now = new Date('2026-10-20T12:00:00Z');
const H = 3_600_000;
const session = (startHoursFromNow: number) => {
  const startsAt = new Date(now.getTime() + startHoursFromNow * H);
  return { startsAt, endsAt: new Date(startsAt.getTime() + 2 * H) };
};

describe('rescheduleJobs', () => {
  it('moves pending reminders and the post-session letter to the new time', () => {
    const s = session(72);
    const out = rescheduleJobs(
      [
        { id: 1, kind: 'reminder_24h', status: 'pending' },
        { id: 2, kind: 'reminder_1h', status: 'pending' },
        { id: 3, kind: 'post_session', status: 'pending' },
      ],
      s,
      now
    );
    expect(out).toEqual([
      { id: 1, sendAt: new Date(s.startsAt.getTime() - 24 * H), status: 'pending' },
      { id: 2, sendAt: new Date(s.startsAt.getTime() - H), status: 'pending' },
      { id: 3, sendAt: new Date(s.endsAt.getTime() + H), status: 'pending' },
    ]);
  });

  it('cancels a reminder whose new moment has passed and revives one that is future again', () => {
    const soon = session(5);
    expect(rescheduleJobs([{ id: 1, kind: 'reminder_24h', status: 'pending' }], soon, now)).toEqual(
      [{ id: 1, sendAt: new Date(soon.startsAt.getTime() - 24 * H), status: 'cancelled' }]
    );
    const later = session(72);
    expect(
      rescheduleJobs([{ id: 1, kind: 'reminder_24h', status: 'cancelled' }], later, now)[0].status
    ).toBe('pending');
  });

  it('leaves sent, failed, confirmation, rescheduled and cancelled post-session jobs alone', () => {
    const out = rescheduleJobs(
      [
        { id: 1, kind: 'reminder_24h', status: 'sent' },
        { id: 2, kind: 'reminder_1h', status: 'failed' },
        { id: 3, kind: 'confirmation', status: 'pending' },
        { id: 4, kind: 'rescheduled', status: 'pending' },
        { id: 5, kind: 'post_session', status: 'cancelled' },
      ],
      session(72),
      now
    );
    expect(out).toEqual([]);
  });
});
