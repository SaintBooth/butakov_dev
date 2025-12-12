"use client"

import { Link } from "@/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Github, Mail, Send } from "lucide-react"

const sitemap = [
  { key: "home", path: "/" },
  { key: "portfolio", path: "/portfolio" },
  { key: "services", path: "/services" },
  { key: "contact", path: "/contact" },
] as const

export function Footer() {
  const locale = useLocale()
  const t = useTranslations("common")

  const handleCookies = () => {
    if (typeof window === "undefined") return
    const open = (window as any).openCookieSettings
    if (typeof open === "function") {
      open()
    }
  }

  return (
    <footer className="border-t border-white/10 bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-background/60 p-6 shadow-[0_20px_70px_-50px_rgba(15,212,200,0.8)]">
            <picture>
              <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
              <img
                src="/logo-light.svg"
                alt="Butakov.dev"
                className="h-8"
              />
            </picture>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Building spatial, glassy interfaces that feel tactile, fast, and privacy-conscious.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-6 shadow-[0_20px_70px_-50px_rgba(15,212,200,0.8)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sitemap</h3>
            <div className="mt-4 grid gap-2">
              {sitemap.map((item) => (
                <Link
                  key={item.key}
                  href={item.path}
                  locale={locale}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-background/60 p-6 shadow-[0_20px_70px_-50px_rgba(15,212,200,0.8)] space-y-4">
            <div className="space-y-2">
              <Link
                href="/privacy"
                locale={locale}
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("privacy")}
              </Link>
              <button
                type="button"
                onClick={handleCookies}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <span>Cookie Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <SocialLink href="https://github.com/devbutakov" label="GitHub">
                <Github className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="https://t.me/butakov_dev" label="Telegram">
                <Send className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="mailto:hello@butakov.dev" label="Email">
                <Mail className="h-5 w-5" />
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{t("copyright")}</p>
          <p className="text-xs">
            Zero-CLS theming • Spatial glassmorphism • Built with Next.js App Router + Shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-background/70 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-[0_15px_40px_-25px_rgba(15,212,200,0.9)]"
      aria-label={label}
    >
      {children}
    </a>
  )
}

