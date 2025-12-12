"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  compact?: boolean
  locale: string
}

export function BrandLogo({ compact = false, locale }: BrandLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to light to match server render and avoid hydration mismatch
  const isDark = mounted && resolvedTheme === "dark"

  const src = compact
    ? "/logo-icon.svg"
    : isDark
      ? "/logo-dark.svg"
      : "/logo-light.svg"

  const width = compact ? 40 : 140
  const height = compact ? 40 : 28

  return (
    <div className={cn("flex items-center")}>
      <Image
        src={src}
        alt="Butakov.dev logo"
        width={width}
        height={height}
        priority
      />
    </div>
  )
}


