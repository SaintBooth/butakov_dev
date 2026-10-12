import type { Sql, TransactionSql } from 'postgres';
import type { RegistrationStatus } from '@/config/workshop';

export interface AdminParticipant {
  registrationId: number;
  fullName: string;
  email: string;
  company: string;
  positionTitle: string | null;
  status: RegistrationStatus;
  recommendScore: number | null;
  mostUseful: string | null;
  followupAnswered: boolean;
}

export function listAdminParticipants(db: Sql | TransactionSql, sessionId: number) {
  return db<AdminParticipant[]>`
    SELECT r.id AS registration_id, p.full_name, p.email, r.company, r.position_title, r.status,
           f.recommend_score, f.most_useful, (fu.registration_id IS NOT NULL) AS followup_answered
    FROM workshop_registrations r
    JOIN workshop_participants p ON p.id = r.participant_id
    LEFT JOIN workshop_feedback f ON f.registration_id = r.id
    LEFT JOIN workshop_followups fu ON fu.registration_id = r.id
    WHERE r.session_id = ${sessionId}
    ORDER BY r.created_at`;
}
