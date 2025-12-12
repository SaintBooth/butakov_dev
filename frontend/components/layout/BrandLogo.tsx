import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  compact?: boolean
  locale: string
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const width = compact ? 40 : 140
  const height = compact ? 40 : 28

  if (compact) {
    return (
      <div className="flex items-center">
        <Image
          src="/logo-icon.svg"
          alt="Butakov.dev logo"
          width={width}
          height={height}
          priority
        />
      </div>
    )
  }

  // Use CSS to instantly switch logos without flash
  // dark: classes work because next-themes adds "dark" class to html
  return (
    <div className="flex items-center">
      {/* Light theme logo - hidden in dark mode */}
      <Image
        src="/logo-light.svg"
        alt="Butakov.dev logo"
        width={width}
        height={height}
        priority
        className="block dark:hidden"
      />
      {/* Dark theme logo - hidden in light mode */}
      <Image
        src="/logo-dark.svg"
        alt="Butakov.dev logo"
        width={width}
        height={height}
        priority
        className="hidden dark:block"
      />
    </div>
  )
}


