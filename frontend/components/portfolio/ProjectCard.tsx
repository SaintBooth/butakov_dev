"use client"

import Image from "next/image"
import { Link } from "@/navigation"
import { useLocale } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

export interface ProjectCardProps {
  id: number
  slug?: string
  title: string
  description: string
  category: "web-dev" | "marketing" | "pet-project"
  tags?: string[]
  featured_image?: string
  demo_url?: string
  github_url?: string
}

const categoryLabels: Record<string, string> = {
  "web-dev": "Web Development",
  "marketing": "Marketing",
  "pet-project": "Pet Project",
}

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function ProjectCard({
  id,
  slug: slugProp,
  title,
  description,
  category,
  tags = [],
  featured_image,
  demo_url,
  github_url,
}: ProjectCardProps) {
  const locale = useLocale()
  const slug = slugProp || generateSlug(title)

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/projects/${slug}` as never} locale={locale} className="block">
        {featured_image && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={featured_image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
              {categoryLabels[category] || category}
            </span>
          </div>
          <CardDescription className="line-clamp-3 mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        {tags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Link>
      <CardFooter className="mt-auto flex gap-2">
        {demo_url && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(demo_url, '_blank', 'noopener,noreferrer')
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Demo
          </Button>
        )}
        {github_url && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(github_url, '_blank', 'noopener,noreferrer')
            }}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
