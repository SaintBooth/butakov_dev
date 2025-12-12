# Quickstart: Project Placeholder Images

**Branch**: `002-project-placeholder-images`  
**Estimated Time**: 30-45 minutes

## Prerequisites

- [ ] Frontend dev server running (`npm run dev` in `/frontend`)
- [ ] At least one project in database WITHOUT `featured_image`

## Quick Implementation

### Step 1: Configure Next.js (5 min)

Edit `frontend/next.config.ts` - add placehold.co to remotePatterns:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
      port: "8000",
      pathname: "/media/**",
    },
    {
      protocol: "https",
      hostname: "placehold.co",  // ADD THIS
    },
  ],
},
```

### Step 2: Create Placeholder Utility (5 min)

Create `frontend/lib/placeholder.ts`:

```typescript
interface PlaceholderOptions {
  width: number
  height: number
  text?: string
  bgColor?: string
  textColor?: string
}

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

// Presets
export const PROJECT_CARD_PLACEHOLDER = getPlaceholderUrl({
  width: 600,
  height: 338,
})

export const PROJECT_DETAIL_PLACEHOLDER = getPlaceholderUrl({
  width: 1200,
  height: 675,
})
```

### Step 3: Update ProjectCard (10 min)

Edit `frontend/components/portfolio/ProjectCard.tsx`:

1. Add import at top:
```typescript
import { PROJECT_CARD_PLACEHOLDER } from "@/lib/placeholder"
```

2. Replace conditional image rendering with always-render pattern:
```tsx
// BEFORE (conditional)
{featured_image && (
  <div className="relative w-full h-48 overflow-hidden">
    <Image src={featured_image} ... />
  </div>
)}

// AFTER (always render)
<div className="relative w-full h-48 overflow-hidden">
  <Image
    src={featured_image || PROJECT_CARD_PLACEHOLDER}
    alt={featured_image ? title : "Project placeholder"}
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-300"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

### Step 4: Update Project Detail Page (10 min)

Edit `frontend/app/[locale]/projects/[slug]/page.tsx`:

1. Add import:
```typescript
import { PROJECT_DETAIL_PLACEHOLDER } from "@/lib/placeholder"
```

2. Replace conditional image:
```tsx
// BEFORE
{project.featured_image && (
  <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
    <Image src={project.featured_image} ... />
  </div>
)}

// AFTER
<div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
  <Image
    src={project.featured_image || PROJECT_DETAIL_PLACEHOLDER}
    alt={project.featured_image ? project.title : "Project placeholder"}
    fill
    className="object-cover"
    priority
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  />
</div>
```

## Verification Checklist

### Visual Check
- [ ] Portfolio page shows placeholder for projects without images
- [ ] Project detail page shows placeholder for projects without images
- [ ] Placeholder matches design (gray background, subtle text)
- [ ] Works in both light and dark mode
- [ ] No layout shift when images load

### PageSpeed Check
Run Lighthouse in Chrome DevTools or use https://pagespeed.web.dev/:
- [ ] Performance score ≥ 95
- [ ] LCP < 2.5s
- [ ] CLS = 0
- [ ] No "Serve images in next-gen formats" warning

### Responsive Check
- [ ] Mobile (< 768px): Placeholder displays correctly
- [ ] Tablet (768px - 1200px): Placeholder displays correctly
- [ ] Desktop (> 1200px): Placeholder displays correctly

## Troubleshooting

### "Invalid src prop" error
→ Check that placehold.co is in `remotePatterns` in next.config.ts

### Placeholder not showing
→ Verify the OR logic: `featured_image || PROJECT_CARD_PLACEHOLDER`
→ Check if `featured_image` is empty string vs null/undefined

### Layout shift (CLS > 0)
→ Ensure image container has fixed height classes (`h-48`, `h-64 md:h-96`)
→ Ensure `fill` prop is used on Image component

### Slow placeholder load
→ Verify using `.webp` format in URL (not default SVG)
→ Check network tab for placehold.co response time
