"use client"

import { Link } from "@/navigation"
import { Suspense, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowUpRight, Github, Sparkles, Terminal, Timer, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/ContactForm"
import { FeaturedProjects } from "@/components/home/FeaturedProjects"
import { HeroSection } from "@/components/home/HeroSection"
import { StackSection } from "@/components/home/StackSection"
import { ServicesGrid } from "@/components/home/ServicesGrid"
import { TypewriterEffect } from "@/components/animations/TypewriterEffect"
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

  const stackItems = useMemo(() => {
    const items = cms.blocks ? (cms.blocks["stack_items"]?.split(",") ?? []) : [
      "Next.js",
      "Django",
      "Docker",
      "Figma",
      "Yandex.Metrika",
      "PostgreSQL",
    ]
    
    // Map items to technologies with categories
    const techMap: Record<string, { category: "frontend" | "backend" | "tools"; description?: string }> = {
      "Next.js": { category: "frontend", description: "SSR, SEO, Performance" },
      "React": { category: "frontend", description: "Component-based UI" },
      "TypeScript": { category: "frontend", description: "Type-safe JavaScript" },
      "Tailwind CSS": { category: "frontend", description: "Utility-first CSS" },
      "Django": { category: "backend", description: "REST API, Admin" },
      "PostgreSQL": { category: "backend", description: "Relational database" },
      "Redis": { category: "backend", description: "Caching, Sessions" },
      "Docker": { category: "tools", description: "Containerization" },
      "Figma": { category: "tools", description: "Design, Prototyping" },
      "Yandex.Metrika": { category: "tools", description: "Analytics, Webvisor" },
    }
    
    return items.map(item => ({
      name: item.trim(),
      category: techMap[item.trim()]?.category || "tools" as const,
      description: techMap[item.trim()]?.description,
    }))
  }, [cms.blocks])


  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 pb-16">
      <HeroSection
        badge={cms.blocks?.hero_badge || fb.hero_badge}
        title={cms.blocks?.hero_h1 || fb.hero_h1}
        subtitle={cms.blocks?.hero_sub || fb.hero_sub}
        ctaPrimary={{ label: cms.blocks?.cta_primary || fb.cta_primary, href: "/portfolio" }}
        ctaSecondary={{ label: cms.blocks?.cta_secondary || fb.cta_secondary, href: "https://github.com/devbutakov" }}
        metrics={{
          lighthouse: 100,
          seo: "A+",
          uptime: "99.9%"
        }}
        codeBlock={[
          "pnpm lint && pnpm test",
          "Deploying to edge...",
          "Perf budget: OK"
        ]}
      />

      <StackSection
        title={cms.blocks?.stack_title || 'The "Infinite" Stack'}
        technologies={stackItems}
        showStatistics={true}
      />

      <ServicesGrid
        title={cms.blocks?.services_title || fb.services_title}
        services={[
          {
            id: "1",
            title: cms.blocks?.service_1_title || fb.service_1_title,
            icon: <Terminal className="h-5 w-5 text-primary" />,
            span: 2,
            content: (
              <div className="rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/80">
                <div className="flex items-center gap-2 text-primary">app.tsx</div>
                <div className="mt-3 space-y-1 text-white/90">
                  <div><TypewriterEffect text={`const layout = glass({ radius: 16, blur: 18 })`} delay={300} /></div>
                  <div><TypewriterEffect text={`const seo = jsonLd({ person: "A. Butakov" })`} delay={300} /></div>
                  <div><TypewriterEffect text={`deploy({ pwa: true, analytics: consented })`} delay={300} /></div>
                </div>
              </div>
            ),
          },
          {
            id: "2",
            title: cms.blocks?.service_2_title || fb.service_2_title,
            icon: <TrendingUp className="h-5 w-5 text-primary" />,
            span: 1,
            content: (
              <div className="flex h-full items-end gap-2">
                {[40, 60, 90, 120].map((h, i) => (
                  <div
                    key={i}
                    className="w-6 rounded-lg bg-gradient-to-t from-primary/40 to-primary"
                    style={{ height: `${h}px`, animation: "pulse 2s ease-in-out infinite", animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            ),
          },
          {
            id: "3",
            title: cms.blocks?.service_3_title || fb.service_3_title,
            icon: <Timer className="h-5 w-5 text-primary" />,
            span: 1,
            content: (
              <div className="relative flex h-full items-center justify-center">
                <div className="h-28 w-28 rounded-full border-4 border-primary/30">
                  <div className="absolute inset-2 rounded-full border-4 border-primary/70 flex items-center justify-center text-2xl font-bold text-primary">
                    100
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "4",
            title: cms.blocks?.service_4_title || fb.service_4_title,
            icon: <Sparkles className="h-5 w-5 text-primary" />,
            span: 2,
            content: (
              <p className="text-sm text-muted-foreground">
                {cms.blocks?.service_4_body || fb.service_4_body}
              </p>
            ),
          },
        ]}
      />

      <FeaturedProjects />

      <Card className="space-y-6 rounded-2xl p-6 md:p-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.cta_title || "Let's Talk"}</h2>
          <p className="text-muted-foreground">{cms.blocks?.cta_sub || "Have a product to launch or optimize? Let's craft it."}</p>
        </div>
        <ContactForm />
      </Card>
    </div>
  )
}


