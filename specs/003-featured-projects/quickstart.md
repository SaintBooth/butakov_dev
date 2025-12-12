# Quickstart: Featured Projects on Homepage

**Feature**: 003-featured-projects  
**Estimated Time**: 1-2 hours  
**Complexity**: Low (mostly reusing existing components)

## Prerequisites

- [x] Project model has `is_featured` field
- [x] API supports `?featured=true` filter
- [x] ProjectCard component exists
- [x] BentoGrid component exists
- [x] Homepage has static "Featured Projects" section to replace

## Implementation Steps

### Step 1: Update API Client (5 min)

**File**: `frontend/lib/api.ts`

Add `fetchFeaturedProjects` function:

```typescript
export async function fetchFeaturedProjects(
  locale: string = "ru",
  limit: number = 6
): Promise<Project[]> {
  const params = new URLSearchParams({
    featured: "true",
    lang: locale,
    page_size: limit.toString(),
  })

  const response = await fetch(`${API_URL}/api/projects/?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch featured projects")
  }

  const data = await parseJsonSafe<ProjectsResponse>(response)
  return data.results
}
```

### Step 2: Create FeaturedProjects Component (20 min)

**File**: `frontend/components/home/FeaturedProjects.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/navigation"
import { fetchFeaturedProjects, Project } from "@/lib/api"
import { ProjectCard } from "@/components/portfolio/ProjectCard"
import { BentoGrid } from "@/components/portfolio/BentoGrid"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { ProjectCardSkeleton } from "@/components/skeletons"

export function FeaturedProjects() {
  const locale = useLocale()
  const t = useTranslations('home')
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

    return () => { mounted = false }
  }, [locale])

  // Hide section if no featured projects (FR-004)
  if (!loading && projects.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('featuredTitle')}
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/portfolio" locale={locale}>
            {t('viewAll')}
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
              slug={project.slug}
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
```

### Step 3: Add Translations (5 min)

**File**: `frontend/messages/ru.json`

```json
{
  "home": {
    "featuredTitle": "Избранные проекты",
    "viewAll": "Все проекты"
  }
}
```

**File**: `frontend/messages/en.json`

```json
{
  "home": {
    "featuredTitle": "Featured Projects",
    "viewAll": "View All"
  }
}
```

### Step 4: Update Homepage (10 min)

**File**: `frontend/app/[locale]/page.tsx`

Replace the static featured projects section with the new component:

```diff
+ import { FeaturedProjects } from "@/components/home/FeaturedProjects"

// ... in the component JSX:

-     <section className="space-y-6">
-       <h2 className="text-2xl font-bold tracking-tight">{cms.blocks?.featured_title || fb.featured_title}</h2>
-       <div className="space-y-4">
-         {featuredProjects.map((project, idx) => (
-           // ... static card rendering
-         ))}
-       </div>
-     </section>

+     <FeaturedProjects />
```

Also remove the `featuredProjects` useMemo and related fallback data.

### Step 5: Test (15 min)

1. **Mark projects as featured** in Django Admin
2. **Verify homepage** displays featured projects
3. **Test language switching** (RU ↔ EN)
4. **Test empty state** (unmark all featured → section hidden)
5. **Test mobile responsiveness**
6. **Verify card links** navigate to project details

## Verification Checklist

- [ ] Featured projects display on homepage
- [ ] Up to 6 projects shown (FR-003)
- [ ] Section hidden when no featured projects (FR-004)
- [ ] Cards link to project details (FR-006)
- [ ] "View All Projects" links to /portfolio (FR-005)
- [ ] Images lazy load (FR-009)
- [ ] Works in Russian and English (FR-012)
- [ ] Mobile responsive (SC-004)
- [ ] No CLS issues (SC-008)

## Optional: API Ordering Enhancement

For strict FR-011 compliance ("order by most recently updated"), update backend:

**File**: `backend/portfolio/views.py`

```python
if featured == 'true':
    queryset = queryset.filter(is_featured=True).order_by('-updated_date')
```

## Rollback Plan

If issues arise, revert homepage to static content by:
1. Remove `<FeaturedProjects />` from page.tsx
2. Restore the static `featuredProjects` section
3. No database changes to revert
