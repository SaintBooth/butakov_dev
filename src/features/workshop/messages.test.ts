import { describe, expect, it } from 'vitest';
import messages from '../../../messages/ru.json';
import {
  AI_LEVELS,
  CHALLENGES,
  COMPANY_SIZES,
  DECISION_ROLES,
  INDUSTRIES,
  POSITION_LEVELS,
  TOPICS,
} from '@/config/workshop';

const options = messages.workshop.options as Record<string, Record<string, string>>;
const email = messages.workshop.email as Record<string, unknown>;

describe('workshop messages', () => {
  it.each([
    ['positionLevel', POSITION_LEVELS],
    ['industry', INDUSTRIES],
    ['companySize', COMPANY_SIZES],
    ['decisionRole', DECISION_ROLES],
    ['aiLevel', AI_LEVELS],
    ['challenges', CHALLENGES],
    ['topics', TOPICS],
  ])('has a label for every %s option', (group, ids) => {
    for (const id of ids) expect(options[group][id], `${group}.${id}`).toBeTruthy();
  });

  it('has a template for every email template id', () => {
    for (const k of [
      'confirmation',
      'reminder_24h',
      'reminder_1h',
      'post_attended',
      'post_missed',
      'followup',
    ]) {
      const tpl = email[k] as { subject?: string; body?: string } | undefined;
      expect(tpl?.subject && tpl.body, k).toBeTruthy();
    }
  });
});
