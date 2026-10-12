import { SITE_URL } from '@/config/landings';

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

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
  feedbackText: 1000,
  followupText: 2000,
} as const;

export const CONSENT_VERSION = '2026-10-09';
export const CONSENT_KINDS = ['pd_processing', 'marketing', 'portfolio', 'quote'] as const;

// The values mirror the CHECK constraints in db/migrations/001_workshop.sql.
export const REGISTRATION_STATUS = {
  registered: 'registered',
  attended: 'attended',
  cancelled: 'cancelled',
} as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

export const EMAIL_JOB_STATUS = {
  pending: 'pending',
  sent: 'sent',
  failed: 'failed',
  cancelled: 'cancelled',
} as const;
export type EmailJobStatus = (typeof EMAIL_JOB_STATUS)[keyof typeof EMAIL_JOB_STATUS];

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
// A form left open longer than this is stale; the visitor is asked to reload it.
export const MAX_STAMP_AGE_MS = DAY_MS;
// Per-ip budgets sit above the per-person ones: colleagues share one NAT address, while rotating
// emails (or tokens) from one address is exactly what the per-ip failure caps are for.
export const RATE_LIMITS = {
  register: { max: 5, windowMs: 10 * MINUTE_MS },
  registerIp: { max: 30, windowMs: 10 * MINUTE_MS },
  checkin: { max: 10, windowMs: 10 * MINUTE_MS },
  checkinIp: { max: 30, windowMs: 10 * MINUTE_MS },
  export: { max: 10, windowMs: 10 * MINUTE_MS },
} as const;
// Upper bound on distinct keys one rate limiter remembers, so a flood of addresses cannot grow memory.
export const MAX_TRACKED_KEYS = 10_000;

// One retry delay per failed attempt; when they run out the job is marked failed (5 attempts total).
export const MAILER = {
  tickMs: MINUTE_MS,
  batchSize: 20,
  retryDelaysMin: [1, 5, 15, 60],
  // nodemailer defaults are minutes; a hung server must not hold a job's row lock that long.
  smtpTimeoutMs: 15_000,
} as const;

export const ICS_PRODID = '-//butakov.dev//workshop//RU';

// Mail clients ignore stylesheets and CSS variables, so the site palette is repeated here as literals.
export const EMAIL_THEME = {
  font: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  page: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  accent: '#0d9488',
  button: '#0b1220',
  buttonText: '#ffffff',
  maxWidth: 560,
} as const;

export const TELEGRAM_API_BASE = 'https://api.telegram.org';
export const TELEGRAM_TIMEOUT_MS = 5000;

// Moscow has had no DST since 2014, so a fixed offset is exact.
export const WORKSHOP_UTC_OFFSET = '+03:00';

export const BOT = {
  dialogTtlMs: 30 * MINUTE_MS,
  participantsPageSize: 50,
  viewLinkTtlMs: 30 * MINUTE_MS,
  pastSessionsLimit: 10,
  titleMaxLength: 120,
  maxDurationMin: 600,
  maxCapacity: 10_000,
  durationPresetsMin: [60, 90, 120, 180],
  capacityPresets: [20, 30, 50],
  // Auto-summary goes out at this Moscow hour on the day after the session ends.
  summaryHour: 10,
  // Sessions older than this never get an auto-summary, so the first deploy does not flood the chat.
  summaryMaxAgeDays: 3,
  slugPrefix: 'ai',
} as const;

const base = `/${WORKSHOP_LOCALE}`;

// Pages that carry a bearer token in ?t=. The analytics blocklist is derived from this list,
// so a new token page cannot be added to the URLs and forgotten in the blocklist.
export const TOKEN_PAGES = ['manage', 'feedback', 'followup'] as const;
export type TokenPage = (typeof TOKEN_PAGES)[number];
const tokenUrl = (page: TokenPage, token: string) => `${base}/workshop/${page}?t=${token}`;

export const WORKSHOP_PATHS = {
  register: (slug: string) => `${base}/workshop/${slug}`,
  checkin: (slug: string) => `${base}/workshop/${slug}/checkin`,
  ics: (slug: string) => `${base}/workshop/${slug}/event.ics`,
  feedback: (token: string) => tokenUrl('feedback', token),
  followup: (token: string) => tokenUrl('followup', token),
  manage: (token: string) => tokenUrl('manage', token),
  admin: (slug: string, token: string) => `${base}/workshop/${slug}/admin?t=${token}`,
  privacy: `${base}/privacy/workshop`,
} as const;

// The admin page sits under a session slug, so it gets its own pattern instead of a TOKEN_PAGES entry.
export const ADMIN_PAGE_PATTERN = new RegExp(`^${base}/workshop/[a-z0-9-]{3,60}/admin/?$`);

// Same uid in the public file and the emailed one, so a calendar updates the event instead of duplicating it.
export function icsUid(slug: string): string {
  return `${slug}@${new URL(SITE_URL).host}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

// Headers a gateway may put the caller's address in; the ip-check route reports them so the owner
// can pick WORKSHOP_IP_HEADER after deploy.
export const IP_CANDIDATE_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'cf-connecting-ip',
  'forwarded',
] as const;
