import type { Sql } from 'postgres';
import { REGISTRATION_STATUS } from '@/config/workshop';
import { insertConsents } from '../db/consents';
import { enqueueEmails } from '../db/emailJobs';
import { countActiveRegistrations } from '../db/registrations';
import type { ConsentKind } from '../domain/consents';
import { planRegistrationEmails } from '../domain/emailPlan';
import type { RegistrationInput } from '../schema';

// The quote consent is given later, on the feedback form.
type RegistrationConsentKind = Exclude<ConsentKind, 'quote'>;

export interface ConsentAudit {
  version: string;
  hashes: Record<RegistrationConsentKind, string>;
  ip: string | null;
  userAgent: string | null;
}

export type RegisterOutcome =
  | { status: 'ok'; registrationId: number; sessionId: number }
  | { status: 'not_found' | 'closed' | 'full' };

interface LockedSession {
  id: number;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  registrationOpen: boolean;
}

export async function registerParticipant(
  db: Sql,
  slug: string,
  input: RegistrationInput,
  audit: ConsentAudit,
  now: Date
): Promise<RegisterOutcome> {
  return db.begin(async (tx) => {
    // The row lock serialises concurrent registrations, so the capacity check below cannot race.
    const [session] = await tx<LockedSession[]>`
      SELECT id, starts_at, ends_at, capacity, registration_open
      FROM workshop_sessions WHERE slug = ${slug} FOR UPDATE`;
    if (!session) return { status: 'not_found' } as const;
    if (!session.registrationOpen || session.startsAt.getTime() <= now.getTime()) {
      return { status: 'closed' } as const;
    }

    // Capacity is checked before any personal data is written: a rejected registrant must leave no
    // participant row behind, since no consent is logged for them.
    const [existing] = await tx<{ status: string }[]>`
      SELECT r.status FROM workshop_registrations r
      JOIN workshop_participants p ON p.id = r.participant_id
      WHERE r.session_id = ${session.id} AND p.email = ${input.email}`;
    const takesNewSeat = !existing || existing.status === REGISTRATION_STATUS.cancelled;
    if (takesNewSeat && (await countActiveRegistrations(tx, session.id)) >= session.capacity) {
      return { status: 'full' } as const;
    }

    const [participant] = await tx<{ id: number }[]>`
      INSERT INTO workshop_participants (email, full_name, full_name_latin)
      VALUES (${input.email}, ${input.fullName}, ${input.fullNameLatin ?? null})
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        full_name_latin = COALESCE(EXCLUDED.full_name_latin, workshop_participants.full_name_latin)
      RETURNING id`;

    const [registration] = await tx<{ id: number }[]>`
      INSERT INTO workshop_registrations (
        session_id, participant_id, company, position_level, position_title, position_latin,
        profile_url, industry, company_size, decision_role, ai_level, task_text, challenges, topics
      ) VALUES (
        ${session.id}, ${participant.id}, ${input.company}, ${input.positionLevel},
        ${input.positionTitle ?? null}, ${input.positionLatin ?? null}, ${input.profileUrl ?? null},
        ${input.industry ?? null}, ${input.companySize ?? null}, ${input.decisionRole ?? null},
        ${input.aiLevel ?? null}, ${input.taskText ?? null},
        ${input.challenges}::text[], ${input.topics}::text[]
      )
      ON CONFLICT (session_id, participant_id) DO UPDATE SET
        company = EXCLUDED.company, position_level = EXCLUDED.position_level,
        position_title = EXCLUDED.position_title, position_latin = EXCLUDED.position_latin,
        profile_url = EXCLUDED.profile_url, industry = EXCLUDED.industry,
        company_size = EXCLUDED.company_size, decision_role = EXCLUDED.decision_role,
        ai_level = EXCLUDED.ai_level, task_text = EXCLUDED.task_text,
        challenges = EXCLUDED.challenges, topics = EXCLUDED.topics,
        status = CASE WHEN workshop_registrations.status = ${REGISTRATION_STATUS.cancelled}
                      THEN ${REGISTRATION_STATUS.registered}
                      ELSE workshop_registrations.status END,
        updated_at = now()
      RETURNING id`;

    const consent = (kind: RegistrationConsentKind, granted: boolean) => ({
      participantId: participant.id,
      registrationId: registration.id,
      kind,
      granted,
      textVersion: audit.version,
      textSha256: audit.hashes[kind],
      ip: audit.ip,
      userAgent: audit.userAgent,
    });
    await insertConsents(tx, [
      consent('pd_processing', input.consentPd),
      consent('marketing', input.consentMarketing),
      consent('portfolio', input.consentPortfolio),
    ]);

    await enqueueEmails(tx, registration.id, planRegistrationEmails(session, now));
    return { status: 'ok', registrationId: registration.id, sessionId: session.id } as const;
  });
}
