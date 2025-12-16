import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "primary"
  size?: "default" | "sm" | "lg"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-medium tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-foreground text-background hover:bg-foreground/90": variant === "default",
        "bg-gradient-to-r from-teal-500 to-emerald-500 text-primary-foreground shadow-[0_0_20px_-5px_#0FD4C8] hover:brightness-110 active:scale-95": variant === "primary",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "h-10 px-4 py-2": size === "default",
        "h-9 rounded-lg px-3": size === "sm",
        "h-11 rounded-lg px-8": size === "lg",
      },
      className
    )

    // If asChild is true, clone the child element and apply classes
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(baseClasses, (children as React.ReactElement<any>).props?.className),
        ref,
        ...props,
      })
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }

