"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const locales = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
] as const

type LanguageSwitcherProps = {
  compact?: boolean
}

export function LanguageSwitcher({ compact }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const switchLocale = (newLocale: string) => {
    if (!pathname) return
    const segments = pathname.split("/")
    segments[1] = newLocale
    const nextPath = segments.join("/") || `/${newLocale}`
    // Cast to any to satisfy Next.js 16 strict route typing
    router.replace(nextPath as Parameters<typeof router.replace>[0])
    router.refresh()
    setOpen(false)
  }

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", closeOnOutside)
    document.addEventListener("keydown", closeOnEsc)
    return () => {
      document.removeEventListener("mousedown", closeOnOutside)
      document.removeEventListener("keydown", closeOnEsc)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/70 px-3 py-2 text-sm font-medium text-foreground shadow-[0_10px_40px_-24px_rgba(15,212,200,0.8)] backdrop-blur transition-colors",
          compact && "px-2.5 py-1.5 text-xs",
          open ? "border-primary/40" : "hover:border-primary/30"
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-sm">{locale.toUpperCase()}</span>
        {!compact && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-white/10 bg-background/90 p-1 shadow-[0_20px_60px_-50px_rgba(15,212,200,0.8)] backdrop-blur"
            role="listbox"
          >
            {locales.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => switchLocale(loc.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-foreground transition-colors",
                  locale === loc.code ? "bg-primary/10 text-primary" : "hover:bg-accent"
                )}
                role="option"
                aria-selected={locale === loc.code}
              >
                <span>{loc.label}</span>
                {locale === loc.code && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

