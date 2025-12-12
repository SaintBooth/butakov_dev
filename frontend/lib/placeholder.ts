/**
 * Placeholder image utilities for projects without featured images.
 * Uses placehold.co service with WebP format for PageSpeed optimization.
 */

interface PlaceholderOptions {
  width: number
  height: number
  text?: string
  bgColor?: string
  textColor?: string
}

/**
 * Generate a placeholder image URL from placehold.co
 * @param options - Configuration for the placeholder image
 * @returns URL string for the placeholder image in WebP format
 */
export function getPlaceholderUrl({
  width,
  height,
  text = "No Image",
  bgColor = "e2e8f0",
  textColor = "64748b",
}: PlaceholderOptions): string {
  const encodedText = text.replace(/\s+/g, "+")
  return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}.webp?text=${encodedText}`
}

/**
 * Preset placeholder for project cards in portfolio grid (16:9 aspect ratio)
 * Dimensions: 600x338px
 */
export const PROJECT_CARD_PLACEHOLDER = getPlaceholderUrl({
  width: 600,
  height: 338,
  text: "No Image",
})

/**
 * Preset placeholder for project detail pages (16:9 aspect ratio, larger)
 * Dimensions: 1200x675px
 */
export const PROJECT_DETAIL_PLACEHOLDER = getPlaceholderUrl({
  width: 1200,
  height: 675,
  text: "No Image",
})
