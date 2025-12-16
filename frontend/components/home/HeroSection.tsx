"use client"

import { Link } from "@/navigation"
import { useLocale } from "next-intl"
import { Github, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypewriterEffect } from "@/components/animations/TypewriterEffect"
import { CounterAnimation } from "@/components/animations/CounterAnimation"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"

interface HeroSectionProps {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  metrics: {
    lighthouse: number;
    seo: string;
    uptime: string;
  };
  codeBlock: string[];
}

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  const isNumeric = typeof value === "number" || (typeof value === "string" && !isNaN(parseFloat(value.replace("%", ""))))
  
  if (label === "SEO") {
    // SEO is always a string like "A+"
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm p-3 text-center">
        <div className="text-xl font-bold tracking-tight text-white">{value}</div>
        <div className="text-xs uppercase text-white/70">{label}</div>
      </div>
    )
  }

  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace("%", ""))

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm p-3 text-center">
      <div className="text-xl font-bold tracking-tight text-white">
        {isNumeric ? (
          <CounterAnimation 
            value={numericValue} 
            format={(v) => {
              if (label === "Uptime") return `${v.toFixed(1)}%`
              return v.toString()
            }}
          />
        ) : (
          value
        )}
      </div>
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

export function HeroSection({
  badge,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  metrics,
  codeBlock,
}: HeroSectionProps) {
  const locale = useLocale()
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 shadow-sm dark:border-white/10 dark:shadow-none md:px-12 md:py-20"
      style={prefersReducedMotion ? {} : { scale, opacity }}
    >
      <AuroraBackground />
      <div className="relative flex flex-col gap-10 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 dark:bg-white/5 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{badge}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            <span className="bg-gradient-to-r from-white via-white to-[#0FD4C8] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            {subtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={ctaPrimary.href} locale={locale}>{ctaPrimary.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-lg border-white/30 text-white hover:bg-white/10">
              <a href={ctaSecondary.href} target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {ctaSecondary.label}
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
                <Stat label="Lighthouse" value={metrics.lighthouse} />
                <Stat label="SEO" value={metrics.seo} />
                <Stat label="Uptime" value={metrics.uptime} />
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <span>build.ts</span>
                  <span className="text-primary">success</span>
                </div>
                <div className="mt-3 space-y-1">
                  {codeBlock.map((line, index) => (
                    <div key={index}>
                      {index === 0 ? (
                        <CodeLine prompt>
                          <TypewriterEffect text={line} delay={300} />
                        </CodeLine>
                      ) : (
                        <CodeLine>
                          <TypewriterEffect text={line} delay={300} />
                        </CodeLine>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  )
}
