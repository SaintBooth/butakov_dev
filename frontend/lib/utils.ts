import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind/clsx class strings safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize external image URLs for Next.js Image:
 * - Trim whitespace
 * - Force HTTPS for api.butakov.dev (avoids optimizer issues with plain HTTP)
 * - Fallback: encode spaces to %20 if URL parsing fails
 */
export function normalizeImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname === "api.butakov.dev" && parsed.protocol === "http:") {
      parsed.protocol = "https:"
    }
    return parsed.toString()
  } catch {
    return trimmed.replace(/ /g, "%20")
  }
}

