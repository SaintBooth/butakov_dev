import { notFound } from 'next/navigation';

/**
 * Catch-all for any path under a locale that doesn't match a real route
 * (typos, deleted pages, bots probing random slugs). Without this, an
 * unmatched path never resolves inside the [locale] tree at all, so Next
 * falls back to its bare unbranded default 404 instead of ../not-found.tsx.
 */
export default function CatchAll() {
  notFound();
}
