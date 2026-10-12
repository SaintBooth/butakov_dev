-- Telegram admin bot: auto-summary marker, reschedule letters, admin view links, wizard state.
ALTER TABLE workshop_sessions ADD COLUMN summary_sent_at timestamptz;

ALTER TABLE workshop_email_jobs DROP CONSTRAINT workshop_email_jobs_kind_check;
ALTER TABLE workshop_email_jobs ADD CONSTRAINT workshop_email_jobs_kind_check CHECK (kind IN
  ('confirmation', 'reminder_24h', 'reminder_1h', 'post_session', 'followup', 'rescheduled'));

-- Only the hash is stored; a link is reusable until it expires so filters and reloads work.
CREATE TABLE workshop_view_links (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_sha256 text NOT NULL UNIQUE,
  session_id   integer NOT NULL REFERENCES workshop_sessions(id),
  expires_at   timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workshop_bot_dialogs (
  chat_id    bigint PRIMARY KEY,
  state      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
