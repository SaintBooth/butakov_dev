"use client"

import { notFound } from "next/navigation"
import { Link } from "@/navigation"
import { use, useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { fetchServices, Service } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

function generateSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = useLocale()
  const { slug } = use(params)
  const [service, setService] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const data = await fetchServices(locale)
        const found = data.results.find((s) => {
          if (s.slug && s.slug === slug) return true
          return generateSlug(s.name) === slug
        })
        if (!found) {
          setError("Not found")
          return
        }
        setService(found)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load service")
      }
    }
    load()
  }, [slug, locale])

  if (error) {
    notFound()
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: service.name,
    description: service.description,
    price: service.price,
    category: service.category,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/services" locale={locale}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{service.description}</p>
          {service.price && <p className="text-lg font-semibold">{service.price}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

