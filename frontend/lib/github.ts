import { Octokit } from "@octokit/rest"

export type GitHubContribution = {
  date: string
  count: number
}

export type GitHubActivityData = {
  contributions: GitHubContribution[]
  totalContributions: number
  streak: number
}

/**
 * Lightweight GitHub activity fetcher using REST events.
 * Works without a token (limited rate), but will use token if provided.
 */
export async function fetchGitHubActivity(username: string, token?: string): Promise<GitHubActivityData> {
  if (!username) {
    throw new Error("GitHub username is required")
  }

  const octokit = new Octokit({
    auth: token || process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    userAgent: "portfolio-app",
  })

  try {
    const res = await octokit.request("GET /users/{username}/events/public", {
      username,
      per_page: 100,
    })

    const contributions: GitHubContribution[] = []
    const grouped: Record<string, number> = {}

    res.data.forEach((event) => {
      const date = event.created_at?.slice(0, 10)
      if (date) grouped[date] = (grouped[date] || 0) + 1
    })

    Object.entries(grouped).forEach(([date, count]) => contributions.push({ date, count }))

    // simple streak calculation from sorted dates
    contributions.sort((a, b) => a.date.localeCompare(b.date))
    let streak = 0
    const today = new Date().toISOString().split("T")[0]
    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i].date > today) continue
      if (contributions[i].count > 0) {
        streak++
      } else {
        break
      }
    }

    return {
      contributions,
      totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
      streak,
    }
  } catch (err) {
    console.error("Error fetching GitHub activity:", err)
    return { contributions: [], totalContributions: 0, streak: 0 }
  }
}

/**
 * Format contribution data into weeks for UI heatmap.
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

