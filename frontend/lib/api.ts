const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Project {
  id: number
  slug?: string
  title: string
  title_ru?: string
  title_en?: string
  description: string
  description_ru?: string
  description_en?: string
  category: "web-dev" | "marketing" | "pet-project"
  tags: string[]
  featured_image?: string
  demo_url?: string
  github_url?: string
  is_featured: boolean
  created_date: string
  updated_date: string
}

export interface ProjectsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Project[]
}

export interface ContactSubmission {
  name: string
  email: string
  phone?: string
  message: string
  consent_given: boolean
}

export interface ContactSubmissionResponse {
  id: number
  status: "success" | "error"
  message?: string
  errors?: Record<string, string[]>
}

export interface Service {
  id: number
  slug?: string
  name: string
  name_ru?: string
  name_en?: string
  description: string
  description_ru?: string
  description_en?: string
  price?: string
  category?: string
  is_featured?: boolean
  order?: number
  created_date?: string
  updated_date?: string
}

export interface ServicesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Service[]
}

export type UIBlockPayload = Record<string, string>

async function parseJsonSafe<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    // @ts-expect-error allow empty json
    return {}
  }
  return JSON.parse(text) as T
}

export async function fetchUIBlocks(section: string, locale: string = "ru"): Promise<UIBlockPayload> {
  const params = new URLSearchParams({ section, lang: locale })
  const response = await fetch(`${API_URL}/api/blocks/?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch UI blocks")
  }
  return parseJsonSafe<UIBlockPayload>(response)
}

export async function fetchProjects(
  locale: string = "ru",
  category?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ProjectsResponse> {
  const params = new URLSearchParams({
    lang: locale,
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  if (category) {
    params.append("category", category)
  }

  const response = await fetch(`${API_URL}/api/projects/?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch projects")
  }

  return parseJsonSafe<ProjectsResponse>(response)
}

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

export async function fetchServices(locale: string = "ru"): Promise<ServicesResponse> {
  const params = new URLSearchParams({
    lang: locale,
  })

  const response = await fetch(`${API_URL}/api/services/?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch services")
  }
  return parseJsonSafe<ServicesResponse>(response)
}

export async function submitContactForm(
  data: ContactSubmission
): Promise<ContactSubmissionResponse> {
  const response = await fetch(`${API_URL}/api/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const responseData = await parseJsonSafe<ContactSubmissionResponse>(response)

  if (!response.ok) {
    throw {
      message: responseData.message || "Failed to submit contact form",
      errors: responseData.errors,
    }
  }

  return responseData
}
