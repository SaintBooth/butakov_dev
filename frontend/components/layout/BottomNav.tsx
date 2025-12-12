"use client"

import { Link } from "@/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Home, Briefcase, Phone, Shield } from "lucide-react"
import { usePathname } from "next/navigation"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const links = [
  { path: "/", icon: Home, labelKey: "home" },
  { path: "/portfolio", icon: Briefcase, labelKey: "portfolio" },
  { path: "/services", icon: Shield, labelKey: "services" },
  { path: "/contact", icon: Phone, labelKey: "contact" },
] as const

export function BottomNav() {
  const locale = useLocale()
  const t = useTranslations("common")
  const pathname = usePathname()
  const normalizedPath = pathname?.replace(/\/$/, "") ?? ""

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-around px-3 py-2">
        <LayoutGroup id="mobile-nav">
          {links.map((item) => {
            const Icon = item.icon
            const href = item.path
            const target = `/${locale}${item.path === "/" ? "" : item.path}`.replace(/\/$/, "")
            const active = target === `/${locale}` ? normalizedPath === target : normalizedPath.startsWith(target)
            return (
              <Link
                key={`${item.path}-${locale}`}
                href={href}
                locale={locale}
                aria-label={t(item.labelKey)}
                className="relative flex min-h-[56px] min-w-[64px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium"
              >
                <AnimatePresence>
                  {active && (
                    <motion.span
                      layoutId="mobile-tab-pill"
                      className="absolute inset-0 rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_15px_50px_-25px_rgba(15,212,200,0.85)]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "relative z-10 text-[11px]",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            )
          })}
        </LayoutGroup>
      </div>
    </nav>
  )
}

