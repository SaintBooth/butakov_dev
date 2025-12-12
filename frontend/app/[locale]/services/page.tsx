"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { fetchServices, Service } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Link } from "@/navigation"

export default function ServicesPage() {
  const locale = useLocale()
  const t = useTranslations("services")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchServices(locale)
        setServices(data.results)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load services")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [locale])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-destructive">{t("error")}</p>
      </div>
    )
  }

  const offerSchema = services[0]
    ? {
        "@context": "https://schema.org",
        "@type": "Offer",
        name: offerName(services[0]),
        description: offerDesc(services[0]),
        price: services[0].price,
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      {offerSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
        />
      )}
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const slug = service.slug || generateSlug(service.name)
          return (
            <Link key={service.id} href={`/services/${slug}` as never} locale={locale} className="h-full">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{service.name || service.name_en || service.name_ru}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    {service.description || service.description_en || service.description_ru}
                  </p>
                  {service.price && (
                    <p className="text-sm font-semibold">
                      {service.price}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function offerName(service: Service) {
  return service.name || service.name_en || service.name_ru || "Service"
}
function offerDesc(service: Service) {
  return service.description || service.description_en || service.description_ru || ""
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

