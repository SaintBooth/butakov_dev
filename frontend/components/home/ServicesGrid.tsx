"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaggeredScroll } from "@/components/animations/StaggeredScroll"
import { TypewriterEffect } from "@/components/animations/TypewriterEffect"
import { cn } from "@/lib/utils"
import { BentoSkeleton } from "@/components/skeletons"
import { motion } from "framer-motion"

interface Service {
  id: string;
  title: string;
  icon: React.ReactNode;
  span: 1 | 2;
  content: React.ReactNode;
}

interface ServicesGridProps {
  title: string;
  services: Service[];
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
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "flex flex-col gap-4 rounded-2xl",
          span === 2 ? "md:col-span-2" : "md:col-span-1"
        )}
      >
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

export function ServicesGrid({ title, services }: ServicesGridProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <Suspense fallback={<BentoSkeleton />}>
        <StaggeredScroll staggerDelay={0.1}>
          <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                span={service.span}
                title={service.title}
                icon={service.icon}
              >
                {service.content}
              </ServiceCard>
            ))}
          </div>
        </StaggeredScroll>
      </Suspense>
    </section>
  )
}
