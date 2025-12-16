import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      color: {
        orange: "border-orange-500/20 text-orange-600 bg-orange-500/5 dark:text-orange-400 dark:bg-orange-500/10",
        cyan: "border-cyan-500/20 text-cyan-600 bg-cyan-500/5 dark:text-cyan-400 dark:bg-cyan-500/10",
        green: "border-green-500/20 text-green-600 bg-green-500/5 dark:text-green-400 dark:bg-green-500/10",
        red: "border-red-500/20 text-red-600 bg-red-500/5 dark:text-red-400 dark:bg-red-500/10",
        blue: "border-blue-500/20 text-blue-600 bg-blue-500/5 dark:text-blue-400 dark:bg-blue-500/10",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
