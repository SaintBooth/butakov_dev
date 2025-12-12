import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Github, ArrowLeft } from "lucide-react"
import { fetchProjects } from "@/lib/api"
import { generateSlug } from "@/components/portfolio/ProjectCard"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

// Force dynamic rendering for this page
export const dynamic = "force-dynamic"

interface ProjectDetailPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// Generate static params for known projects (optional, for ISR)
export async function generateStaticParams() {
  // In production, fetch all project slugs from API
  // For now, return empty array (will be generated on-demand)
  return []
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  
  try {
    // Fetch project data to generate metadata
    const data = await fetchProjects(locale)
    const project = data.results.find((p) => {
      if (p.slug && p.slug === slug) return true
      const candidates = [p.title, p.title_ru, p.title_en].filter(Boolean) as string[]
      return candidates.some((t) => generateSlug(t) === slug)
    })

    if (!project) {
      return {
        title: "Project Not Found",
      }
    }

    return {
      title: `${project.title} | Portfolio`,
      description: project.description,
      openGraph: {
        title: project.title,
        description: project.description,
        images: project.featured_image ? [project.featured_image] : [],
      },
    }
  } catch {
    return {
      title: "Project",
    }
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "project" })

  try {
    const data = await fetchProjects(locale)
    const project = data.results.find((p) => {
      if (p.slug && p.slug === slug) return true
      const candidates = [p.title, p.title_ru, p.title_en].filter(Boolean) as string[]
      return candidates.some((t) => generateSlug(t) === slug)
    })

    if (!project) {
      notFound()
    }

    // Schema.org CreativeWork markup
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      description: project.description,
      creator: {
        "@type": "Person",
        name: "Developer Name", // Update with actual name
      },
      datePublished: project.created_date,
      url: project.demo_url || project.github_url,
      ...(project.github_url && {
        codeRepository: project.github_url,
      }),
    }

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${locale}/portfolio`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToPortfolio")}
          </Link>
        </Button>

        {/* Project Header */}
        <div className="mb-8">
          {project.featured_image && (
            <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src={project.featured_image}
                alt={project.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </div>

            <div className="flex gap-2">
              {project.demo_url && (
                <Button asChild>
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("viewDemo")}
                  </a>
                </Button>
              )}
              {project.github_url && (
                <Button variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    {t("viewCode")}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("aboutProject")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Additional content sections can be added here */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{t("category")}</h4>
                  <span className="text-sm px-2 py-1 rounded-full bg-muted">
                    {project.category}
                  </span>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{t("technologies")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.created_date && (
                  <div>
                    <h4 className="font-semibold mb-2">{t("date")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.created_date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading project:", error)
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-2">{t("unavailable")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("unavailableDesc")}
          </p>
          <Button asChild>
            <Link href={`/${locale}/portfolio`}>{t("backToPortfolio")}</Link>
          </Button>
        </div>
      </div>
    )
  }
}

