CREATE TABLE workshop_sessions (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug              text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,60}$'),
  title             text NOT NULL,
  starts_at         timestamptz NOT NULL,
  ends_at           timestamptz NOT NULL CHECK (ends_at > starts_at),
  meeting_url       text NOT NULL,
  materials_url     text,
  checkin_code      text NOT NULL CHECK (checkin_code ~ '^[A-HJKMNP-Z2-9]{6}$'),
  capacity          integer NOT NULL DEFAULT 30 CHECK (capacity > 0),
  registration_open boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_participants (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           text NOT NULL UNIQUE CHECK (email = lower(email)),
  full_name       text NOT NULL,
  full_name_latin text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_registrations (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id     integer NOT NULL REFERENCES workshop_sessions(id),
  participant_id integer NOT NULL REFERENCES workshop_participants(id),
  company        text NOT NULL,
  position_level text NOT NULL,
  position_title text,
  position_latin text,
  profile_url    text,
  industry       text,
  company_size   text,
  decision_role  text,
  ai_level       text,
  task_text      text,
  challenges     text[] NOT NULL DEFAULT '{}',
  topics         text[] NOT NULL DEFAULT '{}',
  status         text NOT NULL DEFAULT 'registered'
                 CHECK (status IN ('registered', 'attended', 'cancelled')),
  attended_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id)
);

-- Append-only: a revocation is a new row with granted = false.
CREATE TABLE workshop_consents (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  participant_id  integer NOT NULL REFERENCES workshop_participants(id),
  registration_id integer REFERENCES workshop_registrations(id),
  kind            text NOT NULL CHECK (kind IN ('pd_processing', 'marketing', 'portfolio', 'quote')),
  granted         boolean NOT NULL,
  text_version    text NOT NULL,
  text_sha256     text NOT NULL,
  ip              text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workshop_consents_lookup ON workshop_consents (participant_id, kind, id);

CREATE TABLE workshop_tokens (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registration_id integer NOT NULL REFERENCES workshop_registrations(id),
  purpose         text NOT NULL CHECK (purpose IN ('manage', 'feedback', 'followup')),
  token_sha256    text NOT NULL UNIQUE,
  expires_at      timestamptz NOT NULL,
  used_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_feedback (
  registration_id   integer PRIMARY KEY REFERENCES workshop_registrations(id),
  recommend_score   smallint NOT NULL CHECK (recommend_score BETWEEN 0 AND 10),
  applicability     smallint NOT NULL CHECK (applicability BETWEEN 1 AND 5),
  most_useful       text,
  plan_to_implement text,
  testimonial       text,
  wants_review      boolean NOT NULL DEFAULT false,
  followup_ok       boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_followups (
  registration_id integer PRIMARY KEY REFERENCES workshop_registrations(id),
  implemented     text,
  result          text,
  letter_ok       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_email_jobs (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registration_id integer NOT NULL REFERENCES workshop_registrations(id),
  kind            text NOT NULL CHECK (kind IN
                  ('confirmation', 'reminder_24h', 'reminder_1h', 'post_session', 'followup')),
  send_at         timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts        smallint NOT NULL DEFAULT 0,
  last_error      text,
  sent_at         timestamptz,
  UNIQUE (registration_id, kind)
);
CREATE INDEX workshop_email_jobs_due ON workshop_email_jobs (send_at) WHERE status = 'pending';
