// Post-deploy ping: tells IndexNow engines (Yandex, Bing) that the sitemap URLs
// may have changed. Yandex's crawler visited most pages once per 1-2 months;
// IndexNow makes it come back right after a release.
// The key is public by protocol design: it is served at /<key>.txt.
// The URL list comes from the sitemap built in CI: the hosting drops inbound
// connections from GitHub runners, so fetching the live sitemap fails there.
// Falls back to the live sitemap when run elsewhere without a build.

import { readFile } from 'node:fs/promises';

const SITE_URL = 'https://butakov.dev';
const INDEXNOW_KEY = '149be2f3d245f4bcd430c39030d5318c';
const ENDPOINTS = ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow'];
const BUILT_SITEMAP = '.next/server/app/sitemap.xml.body';
const SITEMAP_ATTEMPTS = 6;
const RETRY_DELAY_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractLocs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

async function readBuiltSitemapUrls() {
  try {
    return extractLocs(await readFile(BUILT_SITEMAP, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchSitemapUrls() {
  for (let attempt = 1; attempt <= SITEMAP_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${SITE_URL}/sitemap.xml`);
      if (res.ok) {
        return extractLocs(await res.text());
      }
      console.warn(`sitemap attempt ${attempt}: HTTP ${res.status}`);
    } catch (err) {
      console.warn(`sitemap attempt ${attempt}: ${err.message}`);
    }
    // The release restarts the app; give it time to come up.
    await sleep(RETRY_DELAY_MS);
  }
  throw new Error('sitemap unavailable');
}

async function main() {
  const urlList = (await readBuiltSitemapUrls()) ?? (await fetchSitemapUrls());
  const body = JSON.stringify({
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  for (const endpoint of ENDPOINTS) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    });
    console.log(`${endpoint}: HTTP ${res.status} for ${urlList.length} URLs`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
