import { describe, expect, it } from 'vitest';
import { followupSendAt, nextRetryAt, planRegistrationEmails, resolveJob } from './emailPlan';

const session = {
  startsAt: new Date('2026-10-20T12:00:00Z'),
  endsAt: new Date('2026-10-20T14:00:00Z'),
};

describe('planRegistrationEmails', () => {
  it('plans confirmation, both reminders and the post-session email for an early registration', () => {
    const now = new Date('2026-10-15T10:00:00Z');
    const plan = planRegistrationEmails(session, now);
    expect(plan.map((e) => [e.kind, e.sendAt.toISOString()])).toEqual([
      ['confirmation', now.toISOString()],
      ['reminder_24h', '2026-10-19T12:00:00.000Z'],
      ['reminder_1h', '2026-10-20T11:00:00.000Z'],
      ['post_session', '2026-10-20T15:00:00.000Z'],
    ]);
  });

  it('skips reminders whose moment has passed', () => {
    const now = new Date('2026-10-20T11:30:00Z');
    expect(planRegistrationEmails(session, now).map((e) => e.kind)).toEqual([
      'confirmation',
      'post_session',
    ]);
  });
});

describe('followupSendAt', () => {
  it('is 45 days after the session end', () => {
    expect(followupSendAt(session.endsAt).toISOString()).toBe('2026-12-04T14:00:00.000Z');
  });
});

describe('nextRetryAt', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  it('backs off 1, 5, 15, 60 minutes, then gives up', () => {
    expect(nextRetryAt(1, now)?.toISOString()).toBe('2026-10-20T12:01:00.000Z');
    expect(nextRetryAt(4, now)?.toISOString()).toBe('2026-10-20T13:00:00.000Z');
    expect(nextRetryAt(5, now)).toBeNull();
  });
});

describe('resolveJob', () => {
  it('cancels anything for a cancelled registration', () => {
    expect(resolveJob('reminder_1h', 'cancelled', true)).toEqual({ action: 'cancel' });
  });

  it('picks the post-session variant by attendance', () => {
    expect(resolveJob('post_session', 'attended', true)).toEqual({
      action: 'send',
      template: 'post_attended',
      includeAnnouncement: false,
    });
    expect(resolveJob('post_session', 'registered', true)).toEqual({
      action: 'send',
      template: 'post_missed',
      includeAnnouncement: true,
    });
    expect(resolveJob('post_session', 'registered', false)).toEqual({
      action: 'send',
      template: 'post_missed',
      includeAnnouncement: false,
    });
  });

  it('sends follow-up only to attendees', () => {
    expect(resolveJob('followup', 'registered', false)).toEqual({ action: 'cancel' });
    expect(resolveJob('followup', 'attended', false)).toEqual({
      action: 'send',
      template: 'followup',
      includeAnnouncement: false,
    });
  });
});
