import { z } from 'zod';
import {
  AI_LEVELS,
  CHALLENGES,
  CHECKIN_CODE_LENGTH,
  COMPANY_SIZES,
  DECISION_ROLES,
  FIELD_LIMITS,
  INDUSTRIES,
  MAX_TOPICS,
  POSITION_LEVELS,
  TOPICS,
} from '@/config/workshop';

type T = (key: string) => string;
export type FieldErrors = Record<string, string>;

const LATIN = /^[A-Za-z .,'&()-]+$/;
const HTTPS_URL = /^https:\/\/[^\s/]+\.[^\s]+$/;

const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const trimLower = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : v);

function optionalText(max: number, t: T) {
  return z.preprocess(
    blankToUndefined,
    z
      .string({ error: t('errors.invalid') })
      .trim()
      .max(max, t('errors.tooLong'))
      .optional()
  );
}

function optionalLatin(max: number, t: T) {
  return z.preprocess(
    blankToUndefined,
    z
      .string({ error: t('errors.invalid') })
      .trim()
      .max(max, t('errors.tooLong'))
      .regex(LATIN, t('errors.latin'))
      .optional()
  );
}

function optionalEnum<V extends readonly [string, ...string[]]>(values: V, t: T) {
  return z.preprocess(blankToUndefined, z.enum(values, { error: t('errors.invalid') }).optional());
}

function requiredText(min: number, max: number, message: string) {
  return z.string({ error: message }).trim().min(min, message).max(max, message);
}

// Unticked checkboxes are absent from the form data; a missing flag means "no".
function flag(t: T) {
  return z.boolean({ error: t('errors.invalid') }).default(false);
}

function email(t: T) {
  return z.preprocess(
    trimLower,
    z.email(t('errors.email')).max(FIELD_LIMITS.email, t('errors.email'))
  );
}

export function createRegistrationSchema(t: T) {
  return z.object({
    fullName: requiredText(2, FIELD_LIMITS.fullName, t('errors.fullName')),
    email: email(t),
    company: requiredText(1, FIELD_LIMITS.company, t('errors.company')),
    positionLevel: z.enum(POSITION_LEVELS, { error: t('errors.positionLevel') }),
    positionTitle: optionalText(FIELD_LIMITS.positionTitle, t),
    fullNameLatin: optionalLatin(FIELD_LIMITS.fullNameLatin, t),
    positionLatin: optionalLatin(FIELD_LIMITS.positionLatin, t),
    profileUrl: z.preprocess(
      blankToUndefined,
      z
        .string({ error: t('errors.profileUrl') })
        .trim()
        .max(FIELD_LIMITS.profileUrl, t('errors.profileUrl'))
        .regex(HTTPS_URL, t('errors.profileUrl'))
        .optional()
    ),
    industry: optionalEnum(INDUSTRIES, t),
    companySize: optionalEnum(COMPANY_SIZES, t),
    decisionRole: optionalEnum(DECISION_ROLES, t),
    aiLevel: optionalEnum(AI_LEVELS, t),
    taskText: optionalText(FIELD_LIMITS.taskText, t),
    challenges: z.array(z.enum(CHALLENGES, { error: t('errors.invalid') })),
    topics: z
      .array(z.enum(TOPICS, { error: t('errors.invalid') }))
      .max(MAX_TOPICS, t('errors.topics')),
    consentPd: z.literal(true, { error: t('errors.consentPd') }),
    consentMarketing: flag(t),
    consentPortfolio: flag(t),
  });
}

export function createCheckinSchema(t: T) {
  return z.object({
    email: email(t),
    code: z.preprocess(
      (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
      z.string({ error: t('errors.code') }).length(CHECKIN_CODE_LENGTH, t('errors.code'))
    ),
  });
}

function score(min: number, max: number, t: T) {
  // A blank must fail: z.coerce alone would silently turn '' into 0.
  // Non-numeric input becomes NaN after coerce, failing the type check before
  // downstream .int()/.min()/.max() validators can provide context-specific messages.
  return z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: t('errors.score') })
      .int(t('errors.score'))
      .min(min, t('errors.score'))
      .max(max, t('errors.score'))
  );
}

export function createFeedbackSchema(t: T) {
  return z.object({
    recommendScore: score(0, 10, t),
    applicability: score(1, 5, t),
    mostUseful: optionalText(FIELD_LIMITS.feedbackText, t),
    planToImplement: optionalText(FIELD_LIMITS.feedbackText, t),
    testimonial: optionalText(FIELD_LIMITS.feedbackText, t),
    consentQuote: flag(t),
    wantsReview: flag(t),
    followupOk: flag(t),
  });
}

export function createFollowupSchema(t: T) {
  return z
    .object({
      implemented: optionalText(FIELD_LIMITS.followupText, t),
      result: optionalText(FIELD_LIMITS.followupText, t),
      letterOk: flag(t),
    })
    .refine((d) => Boolean(d.implemented || d.result), {
      message: t('errors.followupEmpty'),
      path: ['implemented'],
    });
}

export type RegistrationInput = z.infer<ReturnType<typeof createRegistrationSchema>>;
export type CheckinInput = z.infer<ReturnType<typeof createCheckinSchema>>;
export type FeedbackInput = z.infer<ReturnType<typeof createFeedbackSchema>>;
export type FollowupInput = z.infer<ReturnType<typeof createFollowupSchema>>;

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
};
const checked = (fd: FormData, key: string) => fd.get(key) === 'on';
const all = (fd: FormData, key: string) =>
  fd.getAll(key).filter((v): v is string => typeof v === 'string');

export function readRegistrationForm(fd: FormData) {
  return {
    fullName: text(fd, 'fullName'),
    email: text(fd, 'email'),
    company: text(fd, 'company'),
    positionLevel: text(fd, 'positionLevel'),
    positionTitle: text(fd, 'positionTitle'),
    fullNameLatin: text(fd, 'fullNameLatin'),
    positionLatin: text(fd, 'positionLatin'),
    profileUrl: text(fd, 'profileUrl'),
    industry: text(fd, 'industry'),
    companySize: text(fd, 'companySize'),
    decisionRole: text(fd, 'decisionRole'),
    aiLevel: text(fd, 'aiLevel'),
    taskText: text(fd, 'taskText'),
    challenges: all(fd, 'challenges'),
    topics: all(fd, 'topics'),
    consentPd: checked(fd, 'consentPd'),
    consentMarketing: checked(fd, 'consentMarketing'),
    consentPortfolio: checked(fd, 'consentPortfolio'),
  };
}

export function readCheckinForm(fd: FormData) {
  return { email: text(fd, 'email'), code: text(fd, 'code') };
}

export function readFeedbackForm(fd: FormData) {
  return {
    recommendScore: text(fd, 'recommendScore'),
    applicability: text(fd, 'applicability'),
    mostUseful: text(fd, 'mostUseful'),
    planToImplement: text(fd, 'planToImplement'),
    testimonial: text(fd, 'testimonial'),
    consentQuote: checked(fd, 'consentQuote'),
    wantsReview: checked(fd, 'wantsReview'),
    followupOk: checked(fd, 'followupOk'),
  };
}

export function readFollowupForm(fd: FormData) {
  return {
    implemented: text(fd, 'implemented'),
    result: text(fd, 'result'),
    letterOk: checked(fd, 'letterOk'),
  };
}

export function issuesToFieldErrors(issues: readonly z.ZodIssue[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return errors;
}
