"use client"

import { Link } from "@/navigation"
import { useLocale } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github } from "lucide-react"
import { PROJECT_CARD_PLACEHOLDER } from "@/lib/placeholder"
import { normalizeImageUrl } from "@/lib/utils"
import { ParallaxImage } from "@/components/animations/ParallaxImage"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

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
  metrics?: {
    lighthouse?: number;
    conversionRate?: number;
    roi?: number;
  };
  codePreview?: string;
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
  metrics,
  codePreview,
}: ProjectCardProps) {
  const locale = useLocale()
  const slug = slugProp || generateSlug(title)
  const imageSrc = normalizeImageUrl(featured_image)
  const [showCodePreview, setShowCodePreview] = useState(false)

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/projects/${slug}` as never} locale={locale} className="block">
        <div className="relative w-full h-48 overflow-hidden">
          <ParallaxImage
            src={imageSrc || PROJECT_CARD_PLACEHOLDER}
            alt={imageSrc ? title : "Project placeholder"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            intensity={0.3}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {codePreview && (
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4"
              onMouseEnter={() => setShowCodePreview(true)}
              onMouseLeave={() => setShowCodePreview(false)}
            >
              <AnimatePresence>
                {showCodePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="font-mono text-xs text-white/90 max-w-full overflow-auto"
                  >
                    <pre className="whitespace-pre-wrap">{codePreview}</pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
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
              {tags.map((tag, index) => {
                // Map common tech tags to Traffic Light colors
                const tagLower = tag.toLowerCase();
                let badgeColor: "orange" | "cyan" | "green" | "red" | "blue" = "blue";
                if (tagLower.includes("bitrix") || tagLower.includes("wordpress") || tagLower.includes("php")) {
                  badgeColor = "orange";
                } else if (tagLower.includes("react") || tagLower.includes("next") || tagLower.includes("typescript")) {
                  badgeColor = "cyan";
                } else if (tagLower.includes("django") || tagLower.includes("python")) {
                  badgeColor = "green";
                }
                return (
                  <Badge key={index} color={badgeColor}>
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        )}
      </Link>
      <CardFooter className="mt-auto flex flex-col gap-2">
        {metrics && (metrics.lighthouse || metrics.conversionRate || metrics.roi) && (
          <div className="w-full rounded-lg border border-white/10 bg-black/40 dark:bg-black/60 p-2 font-mono text-xs text-white/80 space-y-1">
            {metrics.lighthouse !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span>lighthouse --score {metrics.lighthouse}</span>
              </div>
            )}
            {metrics.conversionRate !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span>conversion-rate {metrics.conversionRate}%</span>
              </div>
            )}
            {metrics.roi !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-primary">$</span>
                <span>roi +{metrics.roi}%</span>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
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
        </div>
      </CardFooter>
    </Card>
  )
}
