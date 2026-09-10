import { YM_ID } from '@/config/analytics';

export type CardGoal =
  | 'card_visit'
  | 'card_path_audit'
  | 'card_path_ai'
  | 'card_vcard'
  | 'card_telegram'
  | 'card_lead';

export function reachGoal(goal: CardGoal, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.ym !== 'function') return;
  window.ym(YM_ID, 'reachGoal', goal, params);
}
