import { describe, expect, it } from 'vitest';
import {
  createCheckinSchema,
  createFeedbackSchema,
  createFollowupSchema,
  createRegistrationSchema,
  issuesToFieldErrors,
  readCheckinForm,
  readFeedbackForm,
  readFollowupForm,
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
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.industry).toBeUndefined();
      expect(r.data.positionTitle).toBeUndefined();
    }
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

describe('feedback score boundaries', () => {
  const s = createFeedbackSchema(t);
  const parse = (recommendScore: string, applicability: string) =>
    s.safeParse({ recommendScore, applicability }).success;

  it.each([
    ['0', '1', true],
    ['10', '5', true],
    ['-1', '3', false],
    ['11', '3', false],
    ['5', '0', false],
    ['5', '6', false],
    ['5.5', '3', false],
  ])('recommend %s with applicability %s -> %s', (recommend, applicability, expected) => {
    expect(parse(recommend, applicability)).toBe(expected);
  });

  it('reports the applicability error under its own field', () => {
    const r = s.safeParse({ recommendScore: '5', applicability: '6' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(issuesToFieldErrors(r.error.issues)).toEqual({ applicability: 'errors.score' });
    }
  });
});

describe('followup schema', () => {
  const s = createFollowupSchema(t);

  it('needs at least one of the two answers', () => {
    expect(s.safeParse({ letterOk: false }).success).toBe(false);
    expect(s.safeParse({ implemented: 'RAG по базе знаний', letterOk: false }).success).toBe(true);
    expect(s.safeParse({ result: 'Сэкономили неделю', letterOk: false }).success).toBe(true);
  });

  it('reports the empty answer on the implemented field', () => {
    const r = s.safeParse({ implemented: '   ', result: '', letterOk: true });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(issuesToFieldErrors(r.error.issues)).toEqual({ implemented: 'errors.followupEmpty' });
    }
  });
});

describe('form readers', () => {
  it('reads the check-in fields and defaults absent ones to empty strings', () => {
    expect(
      readCheckinForm(
        form([
          ['email', 'a@b.ru'],
          ['code', 'ab3k9z'],
        ])
      )
    ).toEqual({
      email: 'a@b.ru',
      code: 'ab3k9z',
    });
    expect(readCheckinForm(form([]))).toEqual({ email: '', code: '' });
  });

  it('reads feedback text as strings and checkboxes as booleans', () => {
    const read = readFeedbackForm(
      form([
        ['recommendScore', '9'],
        ['applicability', '4'],
        ['consentQuote', 'on'],
        ['followupOk', 'on'],
      ])
    );
    expect(read).toMatchObject({
      recommendScore: '9',
      applicability: '4',
      mostUseful: '',
      consentQuote: true,
      wantsReview: false,
      followupOk: true,
    });
  });

  it('treats only the value on as ticked', () => {
    expect(readFeedbackForm(form([['wantsReview', 'yes']])).wantsReview).toBe(false);
  });

  it('reads the follow-up answers and the letter tick', () => {
    expect(
      readFollowupForm(
        form([
          ['implemented', 'RAG'],
          ['letterOk', 'on'],
        ])
      )
    ).toEqual({
      implemented: 'RAG',
      result: '',
      letterOk: true,
    });
  });

  it('ignores file uploads in text fields', () => {
    const fd = new FormData();
    fd.append('email', new File(['x'], 'x.txt'));
    expect(readCheckinForm(fd).email).toBe('');
  });
});

describe('issuesToFieldErrors', () => {
  const issue = (path: (string | number)[], message: string) =>
    ({ code: 'custom', path, message }) as const;

  it('keeps the first message per field', () => {
    const errors = issuesToFieldErrors([
      issue(['email'], 'first'),
      issue(['email'], 'second'),
      issue(['company'], 'other'),
    ]);
    expect(errors).toEqual({ email: 'first', company: 'other' });
  });

  it('files issues without a path under form', () => {
    expect(issuesToFieldErrors([issue([], 'root')])).toEqual({ form: 'root' });
  });

  it('keys array element issues by the field name', () => {
    expect(issuesToFieldErrors([issue(['topics', 2], 'bad topic')])).toEqual({
      topics: 'bad topic',
    });
  });
});
