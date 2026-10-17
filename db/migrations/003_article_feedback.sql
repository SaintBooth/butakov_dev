-- Journal "was this helpful?" votes. No IP or user agent: voter_hash is an HMAC of a random
-- browser id. One row per article and reader across locales: translations are the same article.
CREATE TABLE article_feedback (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text        NOT NULL,
  locale      text        NOT NULL CHECK (locale IN ('en', 'ru')),
  helpful     boolean     NOT NULL,
  comment     text        CHECK (char_length(comment) <= 500),
  voter_hash  text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, voter_hash)
);
