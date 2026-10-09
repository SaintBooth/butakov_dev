import { SITE_URL } from '@/config/landings';

export const WORKSHOP_LOCALE = 'ru';
export const WORKSHOP_TIME_ZONE = 'Europe/Moscow';

export const POSITION_LEVELS = [
  'owner_exec',
  'head',
  'manager',
  'engineer',
  'specialist',
  'entrepreneur',
  'other',
] as const;
export const INDUSTRIES = [
  'it',
  'manufacturing',
  'retail',
  'finance',
  'consulting',
  'healthcare',
  'education',
  'public',
  'other',
] as const;
export const COMPANY_SIZES = ['1_10', '11_50', '51_250', '251_plus'] as const;
export const DECISION_ROLES = ['approves', 'influences', 'implements', 'personal'] as const;
export const AI_LEVELS = ['none', 'chats', 'integrates'] as const;
export const CHALLENGES = [
  'data_security',
  'accuracy',
  'cost',
  'integration',
  'team_skills',
  'no_time',
] as const;
export const TOPICS = [
  'assistants',
  'prompting',
  'automation',
  'rag',
  'agents',
  'integration',
  'media',
  'data_security',
] as const;
export const MAX_TOPICS = 3;

// Shared by the zod schema and the input maxLength so the two cannot drift.
export const FIELD_LIMITS = {
  fullName: 100,
  email: 254,
  company: 150,
  positionTitle: 120,
  fullNameLatin: 100,
  positionLatin: 120,
  profileUrl: 300,
  taskText: 1000,
} as const;

export const CONSENT_VERSION = '2026-10-09';
export const CONSENT_KINDS = ['pd_processing', 'marketing', 'portfolio', 'quote'] as const;

// Keep in sync with scripts/workshop/lib.mjs (scripts/workshop/lib.test.ts enforces it).
export const CHECKIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CHECKIN_CODE_LENGTH = 6;
export const CHECKIN_OPENS_BEFORE_END_MIN = 15;
export const CHECKIN_CLOSES_AFTER_END_MIN = 30;

export const TOKEN_TTL_DAYS = { manageAfterEnd: 60, feedback: 14, followup: 30 } as const;
export const TOKEN_MAX_LENGTH = 100;

export const EMAIL_OFFSETS_MIN = { reminder24h: 24 * 60, reminder1h: 60, postSession: 60 } as const;
export const FOLLOWUP_AFTER_END_DAYS = 45;

export const MIN_FILL_MS = 3000;
export const RATE_LIMITS = {
  register: { max: 5, windowMs: 10 * 60_000 },
  checkin: { max: 10, windowMs: 10 * 60_000 },
} as const;

// One retry delay per failed attempt; when they run out the job is marked failed (5 attempts total).
export const MAILER = {
  tickMs: 60_000,
  batchSize: 20,
  retryDelaysMin: [1, 5, 15, 60],
  // nodemailer defaults are minutes; a hung server must not hold a job's row lock that long.
  smtpTimeoutMs: 15_000,
} as const;

export const TELEGRAM_API_BASE = 'https://api.telegram.org';

const base = `/${WORKSHOP_LOCALE}`;
export const WORKSHOP_PATHS = {
  register: (slug: string) => `${base}/workshop/${slug}`,
  checkin: (slug: string) => `${base}/workshop/${slug}/checkin`,
  ics: (slug: string) => `${base}/workshop/${slug}/event.ics`,
  feedback: (token: string) => `${base}/workshop/feedback?t=${token}`,
  followup: (token: string) => `${base}/workshop/followup?t=${token}`,
  manage: (token: string) => `${base}/workshop/manage?t=${token}`,
  privacy: `${base}/privacy/workshop`,
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
