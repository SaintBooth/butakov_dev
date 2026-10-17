const HOUR_MS = 60 * 60 * 1000;

export const JOURNAL_FEEDBACK = {
  commentMaxLength: 500,
  // The counter appears near the limit only, so short answers stay uncluttered.
  commentCounterFrom: 400,
  // Per IP prefix. A "no" with text costs two requests and readers behind one NAT share a key,
  // so votes get a roomy budget; comments, which ping the owner, a strict one.
  rateLimit: {
    votes: { max: 60, windowMs: HOUR_MS },
    comments: { max: 5, windowMs: HOUR_MS },
    // Site-wide ceiling on owner pings; holds even when the IP header is not configured.
    notifications: { max: 30, windowMs: HOUR_MS },
  },
  storageKey: 'journal-feedback:v1',
  voterIdKey: 'journal-feedback:voter',
  // Long enough to see which button registered before the row turns into "thanks".
  thanksHoldMs: 600,
  relatedHighlightMs: 1500,
  // null = counts are never shown publicly; set a number once votes accumulate.
  publicCountThreshold: null as number | null,
} as const;
