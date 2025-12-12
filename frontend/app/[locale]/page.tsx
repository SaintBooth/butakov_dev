"use client"

import { Link } from "@/navigation"
import { Suspense, type ReactNode } from "react"
import { useLocale } from "next-intl"
import { ArrowUpRight, Github, Sparkles, Terminal, Timer, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/ContactForm"
import { cn } from "@/lib/utils"
import { BentoSkeleton } from "@/components/skeletons"
import { useEffect, useMemo, useState } from "react"
import { fetchUIBlocks, UIBlockPayload } from "@/lib/api"

type CMSState = {
  blocks: UIBlockPayload | null
  loading: boolean
  error: string | null
}

export default function Home() {
  const locale = useLocale()
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

  const featuredProjects = useMemo(() => (cms.blocks ? [
    {
      title: cms.blocks["featured_1_title"] || "Project One",
      description: cms.blocks["featured_1_desc"] || "Description",
      tags: (cms.blocks["featured_1_tags"] || "Next.js,Django").split(","),
    },
    {
      title: cms.blocks["featured_2_title"] || "Project Two",
      description: cms.blocks["featured_2_desc"] || "Description",
      tags: (cms.blocks["featured_2_tags"] || "PWA,Analytics").split(","),
    },
  ] : [
    {
      title: "AI Marketing Dashboard",
      description: "Realtime campaign insights with automated scoring and alerts.",
      tags: ["Next.js", "Django", "PostgreSQL"],
    },
    {
      title: "PWA Portfolio Engine",
      description: "Offline-first portfolio with 100/100 Lighthouse and granular analytics consent.",
      tags: ["PWA", "Serwist", "Next-intl"],
    },
  ]), [cms.blocks])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 pb-16">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 shadow-sm dark:border-white/10 dark:shadow-none md:px-12 md:py-20">
        <AuroraBackground />
        <div className="relative flex flex-col gap-10 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{cms.blocks?.hero_badge || "Fullstack Delivery · PWA Ready"}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              <span className="bg-gradient-to-r from-white via-white to-[#0FD4C8] bg-clip-text text-transparent">
                {cms.blocks?.hero_h1 || "Building Digital Products with Logic & Strategy."}
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              {cms.blocks?.hero_sub || "Fullstack Developer & Performance Marketer. Shipping spatial, glassy experiences with measurable business impact."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/portfolio" locale={locale}>{cms.blocks?.cta_primary || "View Work"}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg border-white/30 text-white hover:bg-white/10">
                <a href="https://github.com/devbutakov" target="_blank" rel="noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  {cms.blocks?.cta_secondary || "GitHub"}
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Card className="rounded-2xl border-white/10 bg-white/5 text-white shadow-sm backdrop-blur">
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
        <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.services_title || "Services"}</h2>
        <Suspense fallback={<BentoSkeleton />}>
          <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
            <ServiceCard span={2} title={cms.blocks?.service_1_title || "Fullstack Development"} icon={<Terminal className="h-5 w-5 text-primary" />}>
              <div className="rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/80">
                <div className="flex items-center gap-2 text-primary">app.tsx</div>
                <div className="mt-3 space-y-1 text-white/90">
                  <code>{`const layout = glass({ radius: 16, blur: 18 })`}</code>
                  <code>{`const seo = jsonLd({ person: "A. Butakov" })`}</code>
                  <code>{`deploy({ pwa: true, analytics: consented })`}</code>
                </div>
              </div>
            </ServiceCard>
            <ServiceCard span={1} title={cms.blocks?.service_2_title || "Performance Marketing"} icon={<TrendingUp className="h-5 w-5 text-primary" />}>
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
            <ServiceCard span={1} title={cms.blocks?.service_3_title || "Speed & SEO"} icon={<Timer className="h-5 w-5 text-primary" />}>
              <div className="relative flex h-full items-center justify-center">
                <div className="h-28 w-28 rounded-full border-4 border-primary/30">
                  <div className="absolute inset-2 rounded-full border-4 border-primary/70 flex items-center justify-center text-2xl font-bold text-primary">
                    100
                  </div>
                </div>
              </div>
            </ServiceCard>
            <ServiceCard span={2} title={cms.blocks?.service_4_title || "My Philosophy"} icon={<Sparkles className="h-5 w-5 text-primary" />}>
              <p className="text-sm text-muted-foreground">
                {cms.blocks?.service_4_body || "Ship fast, measure, and iterate. I blend product sense with analytics and push for Lighthouse-grade performance on every deploy."}
              </p>
            </ServiceCard>
          </div>
        </Suspense>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.featured_title || "Featured Projects"}</h2>
        <div className="space-y-4">
          {featuredProjects.map((project, idx) => (
            <Card key={project.title} className="overflow-hidden rounded-2xl border-gray-200/80 shadow-sm dark:border-white/10">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative h-56 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 md:h-full">
                  <div className="absolute inset-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur" />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold tracking-tight">{project.title}</h3>
                  <p className="text-muted-foreground">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-muted-foreground dark:border-white/15">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-gray-200/80 bg-card/60 p-6 shadow-sm dark:border-white/10 dark:shadow-none md:p-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.cta_title || "Let’s Talk"}</h2>
          <p className="text-muted-foreground">{cms.blocks?.cta_sub || "Have a product to launch or optimize? Let’s craft it."}</p>
        </div>
        <ContactForm />
      </section>
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
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-card/80 shadow-sm dark:border-white/10 dark:shadow-none">
      <div className="animate-marquee flex min-w-full gap-6 px-6 py-4 text-sm font-medium uppercase tracking-tight text-muted-foreground">
        {[...items, ...items].map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="rounded-lg border border-gray-200/80 px-4 py-2 transition hover:border-primary hover:text-primary dark:border-white/10"
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
    </div>
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
        "flex flex-col gap-4 rounded-2xl border-gray-200/80 shadow-sm dark:border-white/10 dark:shadow-none",
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
