"use client"

import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/navigation"
import { fetchFeaturedProjects, Project } from "@/lib/api"
import { ProjectCard, generateSlug } from "@/components/portfolio/ProjectCard"
import { BentoGrid } from "@/components/portfolio/BentoGrid"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProjectCardSkeleton } from "@/components/skeletons"

export function FeaturedProjects() {
  const locale = useLocale()
  const t = useTranslations("home")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    fetchFeaturedProjects(locale, 6)
      .then((data) => {
        if (mounted) {
          setProjects(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [locale])

  // Hide section if no featured projects (FR-004)
  if (!loading && projects.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("featuredTitle")}
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/portfolio" locale={locale}>
            {t("viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <BentoGrid>
          {Array.from({ length: 3 }).map((_, idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </BentoGrid>
      ) : error ? (
        <p className="text-destructive text-center py-8">{error}</p>
      ) : (
        <BentoGrid>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              // Fallback slug based on EN/primary title to keep ASCII slugs
              slug={project.slug || generateSlug(project.title_en || project.title || project.title_ru || project.title)}
              title={project.title}
              description={project.description}
              category={project.category}
              tags={project.tags}
              featured_image={project.featured_image}
              demo_url={project.demo_url}
              github_url={project.github_url}
            />
          ))}
        </BentoGrid>
      )}
    </section>
  )
}
