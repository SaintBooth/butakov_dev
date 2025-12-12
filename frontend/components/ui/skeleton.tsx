import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type SkeletonProps = {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted/50", className)} style={style} />
}


