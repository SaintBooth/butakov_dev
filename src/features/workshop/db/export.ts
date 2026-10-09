import type { Sql } from 'postgres';
import { REGISTRATION_STATUS } from '@/config/workshop';
import type { CsvCell } from '../export/csv';

export type ExportKind = 'attendees' | 'feedback' | 'summary' | 'program';
type Table = { headers: string[]; rows: CsvCell[][] };

// The latest consent row per participant decides; a revocation hides the person from every later export.
function hasConsent(db: Sql, kind: 'portfolio' | 'quote') {
  return db`(
    SELECT c.granted FROM workshop_consents c
    WHERE c.participant_id = p.id AND c.kind = ${kind}
    ORDER BY c.id DESC LIMIT 1
  ) IS TRUE`;
}

async function attendees(db: Sql, sessionId: number): Promise<Table> {
  const rows = await db`
    SELECT p.full_name_latin, p.full_name, r.position_latin, r.position_title, r.position_level,
           r.company, r.industry, r.company_size, r.profile_url, r.attended_at
    FROM workshop_registrations r JOIN workshop_participants p ON p.id = r.participant_id
    WHERE r.session_id = ${sessionId} AND r.status = ${REGISTRATION_STATUS.attended} AND ${hasConsent(db, 'portfolio')}
    ORDER BY r.attended_at`;
  return {
    headers: [
      'Name (Latin)',
      'Name',
      'Position (Latin)',
      'Position',
      'Position level',
      'Company',
      'Industry',
      'Company size',
      'Profile URL',
      'Attended at (UTC)',
    ],
    rows: rows.map((r) => [
      r.fullNameLatin,
      r.fullName,
      r.positionLatin,
      r.positionTitle,
      r.positionLevel,
      r.company,
      r.industry,
      r.companySize,
      r.profileUrl,
      r.attendedAt,
    ]),
  };
}

async function feedback(db: Sql, sessionId: number): Promise<Table> {
  const rows = await db`
    SELECT p.full_name, r.position_title, r.company, f.recommend_score, f.applicability,
           f.most_useful, f.plan_to_implement, f.testimonial
    FROM workshop_feedback f
    JOIN workshop_registrations r ON r.id = f.registration_id
    JOIN workshop_participants p ON p.id = r.participant_id
    WHERE r.session_id = ${sessionId} AND ${hasConsent(db, 'quote')}
    ORDER BY f.created_at`;
  return {
    headers: [
      'Name',
      'Position',
      'Company',
      'Recommend score',
      'Applicability',
      'Most useful',
      'Plan to implement',
      'Testimonial',
    ],
    rows: rows.map((r) => [
      r.fullName,
      r.positionTitle,
      r.company,
      r.recommendScore,
      r.applicability,
      r.mostUseful,
      r.planToImplement,
      r.testimonial,
    ]),
  };
}

async function summary(db: Sql, sessionId: number): Promise<Table> {
  const [totals] = await db<
    { registered: number; attended: number; companies: number; responded: number }[]
  >`
    SELECT count(*) FILTER (WHERE r.status <> ${REGISTRATION_STATUS.cancelled})::int AS registered,
           count(*) FILTER (WHERE r.status = ${REGISTRATION_STATUS.attended})::int AS attended,
           count(DISTINCT lower(r.company)) FILTER (WHERE r.status = ${REGISTRATION_STATUS.attended})::int AS companies,
           count(f.registration_id)::int AS responded
    FROM workshop_registrations r LEFT JOIN workshop_feedback f ON f.registration_id = r.id
    WHERE r.session_id = ${sessionId}`;
  const levels = await db<{ positionLevel: string; n: number }[]>`
    SELECT position_level, count(*)::int AS n FROM workshop_registrations
    WHERE session_id = ${sessionId} AND status = ${REGISTRATION_STATUS.attended}
    GROUP BY position_level ORDER BY n DESC`;
  const scores = await db<{ recommendScore: number; n: number }[]>`
    SELECT f.recommend_score, count(*)::int AS n FROM workshop_feedback f
    JOIN workshop_registrations r ON r.id = f.registration_id
    WHERE r.session_id = ${sessionId}
    GROUP BY f.recommend_score ORDER BY f.recommend_score`;
  return {
    headers: ['Metric', 'Value'],
    rows: [
      ['Registered', totals.registered],
      ['Attended', totals.attended],
      ['Companies (distinct)', totals.companies],
      ['Feedback responses', totals.responded],
      ...levels.map((l): CsvCell[] => [`Attended: ${l.positionLevel}`, l.n]),
      ...scores.map((s): CsvCell[] => [`Recommend score ${s.recommendScore}`, s.n]),
    ],
  };
}

async function program(db: Sql, sessionId: number): Promise<Table> {
  const rows = await db<
    {
      positionLevel: string;
      industry: string | null;
      aiLevel: string | null;
      taskText: string | null;
      challenges: string[];
      topics: string[];
    }[]
  >`
    SELECT position_level, industry, ai_level, task_text, challenges, topics
    FROM workshop_registrations
    WHERE session_id = ${sessionId} AND status <> ${REGISTRATION_STATUS.cancelled} ORDER BY id`;
  return {
    headers: ['Position level', 'Industry', 'AI level', 'Task', 'Challenges', 'Topics'],
    rows: rows.map((r) => [
      r.positionLevel,
      r.industry,
      r.aiLevel,
      r.taskText,
      r.challenges.join('; '),
      r.topics.join('; '),
    ]),
  };
}

const builders: Record<ExportKind, (db: Sql, sessionId: number) => Promise<Table>> = {
  attendees,
  feedback,
  summary,
  program,
};

export async function buildExport(db: Sql, slug: string, kind: ExportKind): Promise<Table | null> {
  const [session] = await db<
    { id: number }[]
  >`SELECT id FROM workshop_sessions WHERE slug = ${slug}`;
  return session ? builders[kind](db, session.id) : null;
}
