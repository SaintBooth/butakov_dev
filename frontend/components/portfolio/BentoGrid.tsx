import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoCardProps {
  children: ReactNode
  className?: string
  span?: 1 | 2 | 3
}

export function BentoCard({ children, className, span = 1 }: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4",
        {
          "md:col-span-1": span === 1,
          "md:col-span-2": span === 2,
          "md:col-span-3": span === 3,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

