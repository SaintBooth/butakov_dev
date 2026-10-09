import { describe, expect, it } from 'vitest';
import {
  createCheckinSchema,
  createFeedbackSchema,
  createFollowupSchema,
  createRegistrationSchema,
  issuesToFieldErrors,
  readRegistrationForm,
} from './schema';

const t = (k: string) => k;
const registration = createRegistrationSchema(t);

function form(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
}

const minimal: [string, string][] = [
  ['fullName', 'Иван Петров'],
  ['email', '  Ivan@Example.RU '],
  ['company', 'ООО Ромашка'],
  ['positionLevel', 'head'],
  ['consentPd', 'on'],
];

describe('registration schema', () => {
  it('accepts the minimal form and normalises email', () => {
    const r = registration.safeParse(readRegistrationForm(form(minimal)));
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe('ivan@example.ru');
      expect(r.data.industry).toBeUndefined();
      expect(r.data.topics).toEqual([]);
      expect(r.data.consentMarketing).toBe(false);
    }
  });

  it('turns blank optional fields into undefined', () => {
    const r = registration.safeParse(
      readRegistrationForm(form([...minimal, ['industry', ''], ['positionTitle', '  ']]))
    );
    expect(r.success && r.data.industry === undefined && r.data.positionTitle === undefined).toBe(
      true
    );
  });

  it('requires the personal data consent', () => {
    const r = registration.safeParse(
      readRegistrationForm(form(minimal.filter(([k]) => k !== 'consentPd')))
    );
    expect(r.success).toBe(false);
    if (!r.success) expect(issuesToFieldErrors(r.error.issues).consentPd).toBe('errors.consentPd');
  });

  it('rejects cyrillic in latin fields', () => {
    const r = registration.safeParse(
      readRegistrationForm(form([...minimal, ['fullNameLatin', 'Иван']]))
    );
    expect(r.success).toBe(false);
  });

  it('allows at most three topics', () => {
    const four = ['assistants', 'rag', 'agents', 'media'].map((v): [string, string] => [
      'topics',
      v,
    ]);
    const r = registration.safeParse(readRegistrationForm(form([...minimal, ...four])));
    expect(r.success).toBe(false);
    if (!r.success) expect(issuesToFieldErrors(r.error.issues).topics).toBe('errors.topics');
  });

  it('accepts only https profile links', () => {
    const http = registration.safeParse(
      readRegistrationForm(form([...minimal, ['profileUrl', 'http://x.ru']]))
    );
    const https = registration.safeParse(
      readRegistrationForm(form([...minimal, ['profileUrl', 'https://x.ru/me']]))
    );
    expect(http.success).toBe(false);
    expect(https.success).toBe(true);
  });

  it('rejects tampered enum value and returns localized key', () => {
    const r = registration.safeParse(
      readRegistrationForm(form([...minimal, ['industry', 'invalid_industry']]))
    );
    expect(r.success).toBe(false);
    if (!r.success) expect(issuesToFieldErrors(r.error.issues).industry).toBe('errors.invalid');
  });
});

describe('checkin schema', () => {
  it('upper-cases the code and checks its length', () => {
    const s = createCheckinSchema(t);
    const ok = s.safeParse({ email: 'a@b.ru', code: ' ab3k9z ' });
    expect(ok.success && ok.data.code).toBe('AB3K9Z');
    expect(s.safeParse({ email: 'a@b.ru', code: 'AB3' }).success).toBe(false);
  });
});

describe('feedback schema', () => {
  const s = createFeedbackSchema(t);
  it('requires both scores and rejects a missing one instead of coercing it to 0', () => {
    expect(s.safeParse({ recommendScore: '9', applicability: '4' }).success).toBe(true);
    expect(s.safeParse({ recommendScore: '', applicability: '4' }).success).toBe(false);
    expect(s.safeParse({ recommendScore: '11', applicability: '4' }).success).toBe(false);
  });

  it('rejects non-numeric score and returns localized error key', () => {
    const r = s.safeParse({ recommendScore: 'abc', applicability: '4' });
    expect(r.success).toBe(false);
    if (!r.success) expect(issuesToFieldErrors(r.error.issues).recommendScore).toBe('errors.score');
  });
});

describe('followup schema', () => {
  it('needs at least one of the two answers', () => {
    const s = createFollowupSchema(t);
    expect(s.safeParse({ letterOk: false }).success).toBe(false);
    expect(s.safeParse({ implemented: 'RAG по базе знаний', letterOk: false }).success).toBe(true);
  });
});
