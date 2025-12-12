"use client"

import { useState, useEffect, Suspense } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ProjectCard, generateSlug } from "@/components/portfolio/ProjectCard"
import { BentoGrid } from "@/components/portfolio/BentoGrid"
import { Button } from "@/components/ui/button"
import { fetchProjects, Project } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ProjectCardSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function PortfolioPage() {
  const locale = useLocale()
  const t = useTranslations('portfolio')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: t('allProjects') },
    { id: "web-dev", label: t('webDev') },
    { id: "marketing", label: t('marketing') },
    { id: "pet-project", label: t('petProjects') },
  ] as const

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        setError(null)
        const category = selectedCategory === "all" ? undefined : selectedCategory
        const data = await fetchProjects(locale as string, category)
        setProjects(data.results)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [selectedCategory, locale])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">{t('error')}: {error}</p>
        </div>
      </div>
    )
  }

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const listSchema = projects.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: projects.map((p, idx) => {
          const slug = p.slug || generateSlug(p.title)
          return {
            "@type": "CreativeWork",
            position: idx + 1,
            name: p.title,
            description: p.description,
            url: `${origin}/${locale}/projects/${slug}`,
            genre: p.category,
            image: p.featured_image,
          }
        }),
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      {listSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        />
      )}
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "transition-colors",
              selectedCategory === category.id && "bg-primary text-primary-foreground"
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <Suspense fallback={<ProjectGridSkeleton />}>
        {loading ? (
          <ProjectGridSkeleton />
        ) : projects.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">{t('noProjects')}</p>
          </div>
        ) : (
          <BentoGrid>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
              id={project.id}
              // Fallback slug from EN/primary title to avoid empty slugs in RU
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
      </Suspense>
    </div>
  )
}

function ProjectGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <BentoGrid>
        {Array.from({ length: 6 }).map((_, idx) => (
          <ProjectCardSkeleton key={idx} />
        ))}
      </BentoGrid>
    </div>
  )
}

