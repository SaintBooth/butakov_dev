import { Octokit } from "@octokit/rest"

export type GitHubContribution = {
  date: string
  count: number
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  userAgent: "portfolio-app",
})

export async function fetchGitHubActivity(username: string): Promise<GitHubContribution[]> {
  if (!username) return []
  try {
    const res = await octokit.request("GET /users/{username}/events/public", {
      username,
      per_page: 100,
    })
    const grouped: Record<string, number> = {}
    res.data.forEach((event) => {
      const date = event.created_at?.slice(0, 10)
      if (date) grouped[date] = (grouped[date] || 0) + 1
    })
    return Object.entries(grouped).map(([date, count]) => ({ date, count }))
  } catch {
    return []
  }
}

export function formatContributionData(contributions: GitHubContribution[]): GitHubContribution[] {
  return contributions.sort((a, b) => a.date.localeCompare(b.date))
}
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql"

export interface GitHubContribution {
  date: string
  count: number
}

export interface GitHubActivityData {
  contributions: GitHubContribution[]
  totalContributions: number
  streak: number
}

/**
 * Fetch GitHub contribution data using GraphQL API
 * Uses GitHub's GraphQL API to fetch actual contribution data
 * Cached for 24 hours to avoid rate limiting
 */
export async function fetchGitHubActivity(
  username: string,
  token?: string
): Promise<GitHubActivityData> {
  if (!username) {
    throw new Error("GitHub username is required")
  }

  if (!token) {
    throw new Error("GitHub token is required for GraphQL API")
  }

  try {
    // GraphQL query to fetch contribution data
    const query = `
      query($username: String!) {
        user(login: $username) {
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
        }
      }
    `

    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 86400 }, // Cache for 24 hours (ISR)
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user "${username}" not found`)
      }
      throw new Error("Failed to fetch GitHub data")
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(data.errors[0]?.message || "GitHub API error")
    }

    const calendar = data.data?.user?.contributionsCollection?.contributionCalendar

    if (!calendar) {
      throw new Error("No contribution data found")
    }

    // Flatten weeks into daily contributions
    const contributions: GitHubContribution[] = []
    const weeks = calendar.weeks || []

    for (const week of weeks) {
      for (const day of week.contributionDays || []) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
        })
      }
    }

    // Calculate streak (consecutive days with contributions from today backwards)
    let streak = 0
    const today = new Date().toISOString().split("T")[0]
    
    // Find today's contribution and count backwards
    const todayIndex = contributions.findIndex((c) => c.date === today)
    if (todayIndex >= 0) {
      for (let i = todayIndex; i >= 0; i--) {
        if (contributions[i].count > 0) {
          streak++
        } else {
          break
        }
      }
    }

    return {
      contributions,
      totalContributions: calendar.totalContributions || 0,
      streak,
    }
  } catch (error) {
    console.error("Error fetching GitHub activity:", error)
    throw error
  }
}

/**
 * Format contribution data for display
 */
export function formatContributionData(
  contributions: GitHubContribution[]
): { weeks: Array<{ days: GitHubContribution[] }> } {
  const weeks: Array<{ days: GitHubContribution[] }> = []
  const daysPerWeek = 7

  for (let i = 0; i < contributions.length; i += daysPerWeek) {
    weeks.push({
      days: contributions.slice(i, i + daysPerWeek),
    })
  }

  return { weeks }
}

