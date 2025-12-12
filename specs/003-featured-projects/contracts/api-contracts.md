# API Contracts: Featured Projects

**Feature**: 003-featured-projects  
**Date**: 2025-12-12

## Overview

This feature uses an **existing** API endpoint. No new endpoints required.

---

## GET /api/projects/?featured=true

Fetch projects marked as featured.

### Request

```http
GET /api/projects/?featured=true&lang={locale}&page_size=6 HTTP/1.1
Host: api.example.com
Accept: application/json
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `featured` | string | Yes | Must be `"true"` to filter featured projects |
| `lang` | string | No | Language code: `"ru"` or `"en"`. Default: `"ru"` |
| `page_size` | integer | No | Number of results. Default: 10, Max: 100 |
| `page` | integer | No | Page number for pagination. Default: 1 |

### Response

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "slug": "ai-marketing-dashboard",
      "title": "AI Marketing Dashboard",
      "description": "Realtime campaign insights with automated scoring.",
      "category": "web-dev",
      "tags": ["Next.js", "Django", "PostgreSQL"],
      "featured_image": "https://api.example.com/media/projects/dashboard.webp",
      "demo_url": "https://demo.example.com",
      "github_url": "https://github.com/example/dashboard",
      "is_featured": true,
      "created_date": "2025-01-15T10:30:00Z",
      "updated_date": "2025-12-10T14:22:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `count` | integer | No | Total number of featured projects |
| `next` | string | Yes | URL for next page (null if last page) |
| `previous` | string | Yes | URL for previous page (null if first page) |
| `results` | array | No | Array of Project objects |

### Project Object

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Unique identifier |
| `slug` | string | No | URL-friendly identifier |
| `title` | string | No | Project title (translated based on `lang`) |
| `description` | string | No | Project description (translated) |
| `category` | string | No | One of: `web-dev`, `marketing`, `pet-project` |
| `tags` | array | No | List of technology tags |
| `featured_image` | string | Yes | Full URL to image or null |
| `demo_url` | string | Yes | Live demo URL or null |
| `github_url` | string | Yes | GitHub repository URL or null |
| `is_featured` | boolean | No | Always `true` when filtered |
| `created_date` | string | No | ISO 8601 datetime |
| `updated_date` | string | No | ISO 8601 datetime |

### Error Responses

| Status | Description |
|--------|-------------|
| 200 | Success (empty results array if no featured projects) |
| 500 | Internal server error |

### Example: No Featured Projects

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

---

## Frontend API Client

### New Function (to add to `lib/api.ts`)

```typescript
/**
 * Fetch featured projects for homepage display.
 * @param locale - Language code ('ru' | 'en')
 * @param limit - Maximum number of projects (default: 6)
 * @returns Promise<Project[]> - Array of featured projects
 */
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

### Usage Example

```typescript
// In FeaturedProjects.tsx component
const locale = useLocale()
const [projects, setProjects] = useState<Project[]>([])

useEffect(() => {
  fetchFeaturedProjects(locale, 6)
    .then(setProjects)
    .catch(console.error)
}, [locale])
```

---

## Ordering Note

**Current**: API returns projects ordered by `['order', '-created_date']` (model default)

**Spec Requirement (FR-011)**: "order featured projects by most recently updated"

**Recommendation**: For strict FR-011 compliance, consider adding `-updated_date` ordering when `featured=true`:

```python
# In ProjectListView.get()
if featured == 'true':
    queryset = queryset.filter(is_featured=True).order_by('-updated_date')
```

This is an optional enhancement - current ordering is acceptable for MVP.
