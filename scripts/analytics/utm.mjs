#!/usr/bin/env node
// Usage: node scripts/analytics/utm.mjs <path> <source> <medium> <campaign> [content]
// Allowed values: src/config/utm.ts (UTM_SOURCES / UTM_MEDIUMS / UTM_CONTENTS).
const SITE_URL = 'https://butakov.dev';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const [path, source, medium, campaign, content] = process.argv.slice(2);
if (!path || !source || !medium || !campaign) {
  console.error('usage: utm.mjs <path> <source> <medium> <campaign> [content]  (values: src/config/utm.ts)');
  process.exit(1);
}
if (!SLUG.test(campaign)) {
  console.error(`campaign must be a lowercase slug: "${campaign}"`);
  process.exit(1);
}
const url = new URL(path, SITE_URL);
url.searchParams.set('utm_source', source);
url.searchParams.set('utm_medium', medium);
url.searchParams.set('utm_campaign', campaign);
if (content) url.searchParams.set('utm_content', content);
console.log(url.toString());
