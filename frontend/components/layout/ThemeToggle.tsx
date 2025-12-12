"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = (theme === "system" ? resolvedTheme === "dark" : theme === "dark") || theme === "dark"

  const toggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  if (!mounted) {
    return <div className="h-10 w-10" aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/70 text-foreground shadow-[0_10px_40px_-24px_rgba(15,212,200,0.8)] backdrop-blur transition-colors hover:border-primary/30"
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
    </button>
  )
}

