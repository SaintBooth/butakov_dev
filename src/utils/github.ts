import { z } from 'zod';

export interface GithubContributionDay {
  date: string;
  count: number;
}

export interface GithubActivityData {
  totalContributions: number;
  weeks: GithubContributionDay[][];
  publicRepos: number;
  stars: number;
  followers: number;
}

const GithubGraphQLSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(
            z.object({
              contributionDays: z.array(
                z.object({
                  date: z.string(),
                  contributionCount: z.number(),
                })
              ),
            })
          ),
        }),
      }),
      followers: z.object({ totalCount: z.number() }),
      repositories: z.object({ totalCount: z.number() }),
      topRepos: z.object({
        nodes: z.array(z.object({ stargazerCount: z.number() })),
      }),
    }),
  }),
});

const GITHUB_QUERY = `
  query GithubActivity($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      followers {
        totalCount
      }
      repositories(ownerAffiliations: [OWNER], isFork: false, privacy: PUBLIC) {
        totalCount
      }
      topRepos: repositories(
        first: 100
        ownerAffiliations: [OWNER]
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          stargazerCount
        }
      }
    }
  }
`;

// Contribution calendar is only exposed via GraphQL and requires an authenticated request,
// even for public data — no token means we fall back to demo data (see getDemoGithubActivity).
export async function getGithubActivity(): Promise<GithubActivityData | null> {
  // Named to avoid colliding with the ambient GITHUB_TOKEN GitHub Actions injects into every
  // job (and that some local shells/gh CLI setups export too) — that token can't read contributionsCollection.
  const token = process.env.GH_CONTRIBUTIONS_TOKEN;
  const login = process.env.GITHUB_USERNAME ?? 'SaintBooth';
  if (!token) return null;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: GITHUB_QUERY, variables: { login } }),
      next: { revalidate: 86400 },
    });

    const body = await res.json();

    if (!res.ok || body.errors) {
      console.error('[github] GraphQL request failed', res.status, body.errors ?? body);
      return null;
    }

    const json = GithubGraphQLSchema.parse(body);
    const { user } = json.data;

    return {
      totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
      weeks: user.contributionsCollection.contributionCalendar.weeks.map((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
      ),
      publicRepos: user.repositories.totalCount,
      stars: user.topRepos.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
      followers: user.followers.totalCount,
    };
  } catch (e) {
    console.error('[github] Failed to fetch/parse activity', e);
    return null;
  }
}

// Deterministic seeded PRNG (mulberry32) — demo data stays stable across renders/builds
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const DEMO_SEED = 20260709;

export function getDemoGithubActivity(): GithubActivityData {
  const random = mulberry32(DEMO_SEED);
  const weeks: GithubContributionDay[][] = [];

  const cursor = new Date();
  cursor.setDate(cursor.getDate() - WEEKS_IN_YEAR * DAYS_IN_WEEK);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  let totalContributions = 0;

  for (let w = 0; w < WEEKS_IN_YEAR; w++) {
    const days: GithubContributionDay[] = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const isWeekend = d === 0 || d === 6;
      const roll = random();
      const count = roll > 0.25 ? Math.round(random() * (isWeekend ? 3 : 8)) : 0;
      totalContributions += count;
      days.push({ date: cursor.toISOString().slice(0, 10), count });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(days);
  }

  return {
    totalContributions,
    weeks,
    publicRepos: 34,
    stars: 128,
    followers: 42,
  };
}

export function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}
