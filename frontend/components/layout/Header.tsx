"use client"

import { Link } from "@/navigation"
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/layout/BrandLogo"

const navItems = [
  { key: "home", path: "/" },
  { key: "portfolio", path: "/portfolio" },
  { key: "services", path: "/services" },
  { key: "contact", path: "/contact" },
] as const

export function Header() {
  const locale = useLocale()
  const t = useTranslations("common")
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="hidden w-full items-center gap-6 py-4 md:flex">
          <Link href="/" locale={locale} aria-label="Butakov.dev home" className="flex items-center">
            <BrandLogo locale={locale} />
          </Link>
          <div className="flex flex-1 justify-center">
            <NavLinks activePath={pathname} locale={locale} label={t} />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              asChild
              className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-[0_10px_40px_-18px_rgba(15,212,200,0.8)] hover:bg-primary/90"
            >
              <Link href="/contact" locale={locale}>{t("discussProject")}</Link>
            </Button>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="flex w-full items-center justify-between py-3 md:hidden">
          <Link href="/" locale={locale} aria-label="Butakov.dev home" className="flex items-center">
            <BrandLogo compact locale={locale} />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLinks({
  activePath,
  locale,
  label,
}: {
  activePath: string | null
  locale: string
  label: (key: string) => string
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const normalizedPath = activePath?.replace(/\/$/, "") ?? ""

  return (
    <LayoutGroup id="main-nav">
      <nav className="relative flex items-center gap-1 rounded-full border border-white/10 bg-background/70 px-2 py-1 backdrop-blur shadow-[0_20px_60px_-45px_rgba(15,212,200,0.8)]">
        {navItems.map((item) => {
          const href = item.path
          const target = `/${locale}${item.path === "/" ? "" : item.path}`.replace(/\/$/, "")
          const active = target === `/${locale}` ? normalizedPath === target : normalizedPath.startsWith(target)
          return (
            <NavLink
              key={item.key}
              href={href}
              highlight={!!active || hovered === item.key}
              onHover={() => setHovered(item.key)}
              onLeave={() => setHovered(null)}
              locale={locale}
            >
              {label(item.key)}
            </NavLink>
          )
        })}
      </nav>
    </LayoutGroup>
  )
}

function NavLink({
  href,
  highlight,
  onHover,
  onLeave,
  locale,
  children,
}: {
  href: string
  highlight: boolean
  onHover: () => void
  onLeave: () => void
  locale: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Link
        href={href}
        locale={locale}
        className={cn(
          "relative flex min-w-[96px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
          highlight ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        onMouseEnter={onHover}
        onFocus={onHover}
        onMouseLeave={onLeave}
        onBlur={onLeave}
      >
        <AnimatePresence>
          {highlight && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-full border border-primary/25 bg-primary/10 shadow-[0_10px_40px_-20px_rgba(15,212,200,0.8)]"
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          )}
        </AnimatePresence>
        <span className="relative z-10">{children}</span>
      </Link>
    </div>
  )
}

