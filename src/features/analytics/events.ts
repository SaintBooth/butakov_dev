import { z } from 'zod';
import { LANDING_IDS, type LandingId } from '@/config/landings';

export const LEAD_PLACEMENTS = [
  'header',
  'hero',
  'mobile_menu',
  'tab_bar',
  'services',
  'landing_hero',
  'journal_cta',
  'contact_section',
] as const;
export type LeadPlacement = (typeof LEAD_PLACEMENTS)[number];

export const LEAD_FORMS = ['modal', 'section'] as const;
export type LeadForm = (typeof LEAD_FORMS)[number];

export const LEAD_ERROR_REASONS = ['validation', 'server', 'network'] as const;
export type LeadErrorReason = (typeof LEAD_ERROR_REASONS)[number];

export const OUTBOUND_KINDS = [
  'telegram',
  'email',
  'phone',
  'github',
  'promptspace',
  'external',
] as const;
export type OutboundKind = (typeof OUTBOUND_KINDS)[number];

export const READ_DEPTHS = [25, 50, 75, 100] as const;
export type ReadDepth = (typeof READ_DEPTHS)[number];

export const ARTICLE_KINDS = ['case', 'opinion'] as const;
export type ArticleKind = (typeof ARTICLE_KINDS)[number];

const landing = z.enum(LANDING_IDS as [LandingId, ...LandingId[]]);
const empty = z.strictObject({});

export const EVENT_SCHEMAS = {
  lead_open: z.strictObject({ placement: z.enum(LEAD_PLACEMENTS), service: z.string().optional() }),
  lead_submit: z.strictObject({
    form: z.enum(LEAD_FORMS),
    service: z.string().optional(),
    placement: z.enum(LEAD_PLACEMENTS).optional(),
  }),
  lead_error: z.strictObject({ reason: z.enum(LEAD_ERROR_REASONS) }),
  outbound_click: z.strictObject({ kind: z.enum(OUTBOUND_KINDS), host: z.string() }),
  read_depth: z.strictObject({
    slug: z.string(),
    kind: z.enum(ARTICLE_KINDS),
    depth: z.literal([...READ_DEPTHS]),
  }),
  article_helpful: z.strictObject({ slug: z.string(), value: z.enum(['yes', 'no']) }),
  // Reader text never goes to analytics, only the fact that a comment was sent.
  article_helpful_comment: z.strictObject({ slug: z.string() }),
  faq_open: z.strictObject({ landing, q: z.number().int().nonnegative() }),
  pricing_view: z.strictObject({ landing }),
  workshop_register: z.strictObject({ session: z.string() }),
  workshop_register_error: z.strictObject({ reason: z.enum(['validation', 'server']) }),
  workshop_calendar_add: z.strictObject({ session: z.string() }),
  card_visit: empty,
  card_path_audit: empty,
  card_path_ai: empty,
  card_vcard: empty,
  card_telegram: empty,
  card_lead: z.strictObject({ direction: z.enum(['audit', 'ai']) }),
  not_found: z.strictObject({ path: z.string() }),
} as const;

export type AnalyticsEvent = keyof typeof EVENT_SCHEMAS;
export const ANALYTICS_EVENTS = Object.keys(EVENT_SCHEMAS) as AnalyticsEvent[];
export type EventData<E extends AnalyticsEvent> = z.infer<(typeof EVENT_SCHEMAS)[E]>;

/** `{ event, data }` pair, used by declarative trackers (`TrackSeen`) that take an event as props. */
export type TrackSpec = { [E in AnalyticsEvent]: { event: E; data: EventData<E> } }[AnalyticsEvent];
