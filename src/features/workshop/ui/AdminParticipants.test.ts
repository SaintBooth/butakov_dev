import { describe, expect, it } from 'vitest';
import { filterParticipants, formatRecommend } from './AdminParticipants';

const p = (status: 'registered' | 'attended' | 'cancelled') => ({ status });

describe('filterParticipants', () => {
  it('keeps everyone for all and narrows by status', () => {
    const list = [p('registered'), p('attended'), p('cancelled')];
    expect(filterParticipants(list, 'all')).toHaveLength(3);
    expect(filterParticipants(list, 'attended')).toEqual([p('attended')]);
  });
});

describe('formatRecommend', () => {
  it('fills the score into the template', () => {
    expect(formatRecommend('Порекомендует: {score}/10', 9)).toBe('Порекомендует: 9/10');
  });
});
