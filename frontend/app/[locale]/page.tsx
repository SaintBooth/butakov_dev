"use client"

import { Link } from "@/navigation"
import { Suspense, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowUpRight, Github, Sparkles, Terminal, Timer, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/ContactForm"
import { FeaturedProjects } from "@/components/home/FeaturedProjects"
import { cn } from "@/lib/utils"
import { BentoSkeleton } from "@/components/skeletons"
import { useEffect, useMemo, useState } from "react"
import { fetchUIBlocks, UIBlockPayload } from "@/lib/api"

// Locale-aware fallback values to prevent flash
const fallbacks = {
  en: {
    hero_badge: "Fullstack Delivery · PWA Ready",
    hero_h1: "Building Digital Products with Logic & Strategy.",
    hero_sub: "Fullstack Developer & Performance Marketer. Shipping spatial, glassy experiences with measurable business impact.",
    cta_primary: "View Work",
    cta_secondary: "GitHub",
    services_title: "Services",
    service_1_title: "Fullstack Development",
    service_2_title: "Performance Marketing",
    service_3_title: "Speed & SEO",
    service_4_title: "My Philosophy",
    service_4_body: "Ship fast, measure, and iterate. I blend product sense with analytics and push for Lighthouse-grade performance on every deploy.",
    stack_title: "The \"Infinite\" Stack",
    cta_title: "Let's Talk",
    cta_sub: "Have a product to launch or optimize? Let's craft a solution that works.",
  },
  ru: {
    hero_badge: "Fullstack-разработка · PWA",
    hero_h1: "Создаю цифровые продукты с логикой и стратегией.",
    hero_sub: "Fullstack-разработчик и перформанс-маркетолог. Запускаю быстрые, измеримые продукты от идеи до продакшена.",
    cta_primary: "Смотреть работы",
    cta_secondary: "GitHub",
    services_title: "Услуги",
    service_1_title: "Fullstack-разработка",
    service_2_title: "Перформанс-маркетинг",
    service_3_title: "Скорость и SEO",
    service_4_title: "Моя философия",
    service_4_body: "Быстро запускаю, измеряю и итерирую. Объединяю продуктовое мышление с техническим исполнением.",
    stack_title: "«Бесконечный» стек",
    cta_title: "Давайте поговорим",
    cta_sub: "Есть продукт для запуска или оптимизации? Давайте создадим решение, которое работает.",
  },
} as const

type CMSState = {
  blocks: UIBlockPayload | null
  loading: boolean
  error: string | null
}

export default function Home() {
  const locale = useLocale()
  const fb = fallbacks[locale as keyof typeof fallbacks] || fallbacks.en
  const [cms, setCms] = useState<CMSState>({ blocks: null, loading: true, error: null })

  useEffect(() => {
    let mounted = true
    fetchUIBlocks("HOMEPAGE", locale)
      .then((data) => {
        if (mounted) setCms({ blocks: data, loading: false, error: null })
      })
      .catch((err) => {
        if (mounted) setCms({ blocks: null, loading: false, error: err.message || "Failed to load content" })
      })
    return () => {
        mounted = false
    }
  }, [locale])

  const stackItems = useMemo(() => (cms.blocks ? (cms.blocks["stack_items"]?.split(",") ?? []) : [
    "Next.js",
    "Django",
    "Docker",
    "Figma",
    "Yandex.Metrika",
    "PostgreSQL",
  ]), [cms.blocks])


  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 pb-16">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 shadow-sm dark:border-white/10 dark:shadow-none md:px-12 md:py-20">
        <AuroraBackground />
        <div className="relative flex flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 dark:bg-white/5 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{cms.blocks?.hero_badge || fb.hero_badge}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              <span className="bg-gradient-to-r from-white via-white to-[#0FD4C8] bg-clip-text text-transparent">
                {cms.blocks?.hero_h1 || fb.hero_h1}
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              {cms.blocks?.hero_sub || fb.hero_sub}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/portfolio" locale={locale}>{cms.blocks?.cta_primary || fb.cta_primary}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg border-white/30 text-white hover:bg-white/10">
                <a href="https://github.com/devbutakov" target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  {cms.blocks?.cta_secondary || fb.cta_secondary}
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Card variant="liquid-crystal" className="rounded-2xl text-white">
              <CardHeader>
                <CardTitle className="text-white">Delivery Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <Stat label="Lighthouse" value="100" />
                  <Stat label="SEO" value="A+" />
                  <Stat label="Uptime" value="99.9%" />
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/80">
                  <div className="flex items-center justify-between">
                    <span>build.ts</span>
                    <span className="text-primary">success</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <CodeLine prompt>pnpm lint && pnpm test</CodeLine>
                    <CodeLine>Deploying to edge...</CodeLine>
                    <CodeLine>Perf budget: OK</CodeLine>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.stack_title || 'The “Infinite” Stack'}</h2>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <Marquee items={stackItems} />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.services_title || fb.services_title}</h2>
        <Suspense fallback={<BentoSkeleton />}>
          <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
            <ServiceCard span={2} title={cms.blocks?.service_1_title || fb.service_1_title} icon={<Terminal className="h-5 w-5 text-primary" />}>
              <div className="rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/80">
                <div className="flex items-center gap-2 text-primary">app.tsx</div>
                <div className="mt-3 space-y-1 text-white/90">
                  <code>{`const layout = glass({ radius: 16, blur: 18 })`}</code>
                  <code>{`const seo = jsonLd({ person: "A. Butakov" })`}</code>
                  <code>{`deploy({ pwa: true, analytics: consented })`}</code>
                </div>
              </div>
            </ServiceCard>
            <ServiceCard span={1} title={cms.blocks?.service_2_title || fb.service_2_title} icon={<TrendingUp className="h-5 w-5 text-primary" />}>
              <div className="flex h-full items-end gap-2">
                {[40, 60, 90, 120].map((h, i) => (
                  <div
                    key={i}
                    className="w-6 rounded-lg bg-gradient-to-t from-primary/40 to-primary"
                    style={{ height: `${h}px`, animation: "pulse 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </ServiceCard>
            <ServiceCard span={1} title={cms.blocks?.service_3_title || fb.service_3_title} icon={<Timer className="h-5 w-5 text-primary" />}>
              <div className="relative flex h-full items-center justify-center">
                <div className="h-28 w-28 rounded-full border-4 border-primary/30">
                  <div className="absolute inset-2 rounded-full border-4 border-primary/70 flex items-center justify-center text-2xl font-bold text-primary">
                    100
                  </div>
                </div>
              </div>
            </ServiceCard>
            <ServiceCard span={2} title={cms.blocks?.service_4_title || fb.service_4_title} icon={<Sparkles className="h-5 w-5 text-primary" />}>
              <p className="text-sm text-muted-foreground">
                {cms.blocks?.service_4_body || fb.service_4_body}
              </p>
            </ServiceCard>
          </div>
        </Suspense>
      </section>

      <FeaturedProjects />

      <Card className="space-y-6 rounded-2xl p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.cta_title || "Let’s Talk"}</h2>
          <p className="text-muted-foreground">{cms.blocks?.cta_sub || "Have a product to launch or optimize? Let’s craft it."}</p>
        </div>
        <ContactForm />
      </Card>
    </div>
  )
}

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm p-3 text-center">
      <div className="text-xl font-bold tracking-tight text-white">{value}</div>
      <div className="text-xs uppercase text-white/70">{label}</div>
    </div>
  )
}

function CodeLine({ children, prompt }: { children: React.ReactNode; prompt?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {prompt && <span className="text-primary">›</span>}
      <span>{children}</span>
    </div>
  )
}

function Marquee({ items }: { items: string[] }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl">
      <div className="animate-marquee flex min-w-full gap-6 px-6 py-4 text-sm font-medium uppercase tracking-tight text-muted-foreground">
        {[...items, ...items].map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="rounded-lg border border-gray-200/80 dark:border-white/10 px-4 py-2 transition hover:border-primary hover:text-primary"
          >
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
          width: max-content;
        }
      `}</style>
    </Card>
  )
}

function ServiceCard({
  span,
  title,
  icon,
  children,
}: {
  span?: 1 | 2
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 rounded-2xl",
        span === 2 ? "md:col-span-2" : "md:col-span-1"
      )}
    >
      <CardHeader className="flex flex-row items-center gap-2 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  )
}
