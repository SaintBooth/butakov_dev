"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGitHubActivity, formatContributionData, GitHubContribution } from "@/lib/github"
import { cn } from "@/lib/utils"

interface GitHubActivityProps {
  username: string
  token?: string
}

const CONTRIBUTION_LEVELS = [
  { min: 0, max: 0, color: "bg-muted" },
  { min: 1, max: 2, color: "bg-green-500/20" },
  { min: 3, max: 4, color: "bg-green-500/40" },
  { min: 5, max: 6, color: "bg-green-500/60" },
  { min: 7, max: Infinity, color: "bg-green-500" },
]

function getContributionColor(count: number): string {
  for (const level of CONTRIBUTION_LEVELS) {
    if (count >= level.min && count <= level.max) {
      return level.color
    }
  }
  return CONTRIBUTION_LEVELS[0].color
}

export function GitHubActivity({ username, token }: GitHubActivityProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityData, setActivityData] = useState<{
    contributions: GitHubContribution[]
    totalContributions: number
    streak: number
  } | null>(null)

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchGitHubActivity(username, token)
        setActivityData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load GitHub activity")
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadActivity()
    }
  }, [username, token])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub Activity</CardTitle>
          <CardDescription>Loading contribution data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GitHub Activity</CardTitle>
          <CardDescription>Unable to load activity data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">
              {error}. GitHub activity data is temporarily unavailable.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activityData) {
    return null
  }

  const { weeks } = formatContributionData(activityData.contributions)
  const last52Weeks = weeks.slice(-52) // Show last 52 weeks

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Activity</CardTitle>
        <CardDescription>
          {activityData.totalContributions} contributions in the last year
          {activityData.streak > 0 && ` • ${activityData.streak} day streak`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contribution Graph */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {last52Weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.days.map((day, dayIndex) => {
                  const date = new Date(day.date)
                  const isToday =
                    date.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-colors",
                        getContributionColor(day.count),
                        isToday && "ring-2 ring-primary ring-offset-1"
                      )}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-green-500/20" />
              <div className="w-3 h-3 rounded-sm bg-green-500/40" />
              <div className="w-3 h-3 rounded-sm bg-green-500/60" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
            </div>
            <span>More</span>
          </div>

          {/* Link to GitHub */}
          <div className="pt-2">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View GitHub Profile →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

