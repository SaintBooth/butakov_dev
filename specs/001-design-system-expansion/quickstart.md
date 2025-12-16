# Quickstart: Design System Expansion Implementation

**Feature**: Architectural Review & Design System Expansion  
**Date**: 2025-01-27  
**Phase**: Phase 1 - Design

## Overview

This guide provides step-by-step instructions for implementing the design system expansion. The implementation is frontend-only and focuses on creating reusable design tokens, updating components, and implementing the Layout component with float/anchored modes.

## Prerequisites

- Next.js 16.0.8+ with App Router
- Tailwind CSS v4
- next-themes 0.4.6+
- Framer Motion 11.0.0+
- Existing Shadcn/ui components

## Implementation Steps

### Step 1: Add Design Token CSS Classes

**File**: `frontend/app/globals.css`

Add the following CSS classes after existing theme variables:

```css
/* Ceramic Design Token (Light Mode) */
.card-ceramic {
  @apply bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50;
}

/* Liquid Crystal Design Token (Dark Mode) */
.card-liquid {
  background-color: rgb(15 23 42 / 0.95); /* Fallback for browsers without backdrop-blur */
}

@supports (backdrop-filter: blur(16px)) {
  .card-liquid {
    @apply bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)];
    background-image: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
  }
}

/* Inset Input Styling */
.input-inset {
  @apply bg-muted/50 border border-border shadow-inner;
}

/* Reading Surface (Opaque for long-form content) */
.reading-surface {
  @apply bg-white dark:bg-slate-900/95;
}
```

### Step 2: Create Design Token Utilities

**File**: `frontend/components/design-system/tokens.ts` (new file)

```typescript
import { cn } from "@/lib/utils";

export const ceramicCardClasses = "bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50";

export const liquidCardClasses = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)] bg-gradient-to-b from-white/5 to-transparent";

export const getCardClasses = (isDark: boolean, readingSurface?: boolean) => {
  if (readingSurface) {
    return "bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10";
  }
  return isDark ? liquidCardClasses : ceramicCardClasses;
};
```

### Step 3: Update Card Component

**File**: `frontend/components/ui/card.tsx`

Update the Card component to support variants:

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getCardClasses } from "@/components/design-system/tokens"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ceramic" | "liquid-crystal" | "default";
  readingSurface?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, readingSurface, ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    const cardClasses = readingSurface
      ? "bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10"
      : variant === "ceramic"
      ? "card-ceramic"
      : variant === "liquid-crystal"
      ? "card-liquid"
      : getCardClasses(isDark, readingSurface);

    return (
      <div
        ref={ref}
        className={cn(cardClasses, className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// ... rest of Card sub-components remain unchanged
```

### Step 4: Migrate Homepage Cards to Standardized Tokens

**File**: `frontend/app/[locale]/page.tsx`

**IMPORTANT**: Per clarification, homepage cards MUST migrate to use Liquid Crystal (dark) / Ceramic (light) design tokens to maintain consistency with the global application style.

Update all Card components on the homepage to use the standardized tokens:

```typescript
// Before (custom glassmorphism):
<Card className="rounded-2xl border-white/10 bg-white/5 text-white shadow-sm backdrop-blur">

// After (standardized Liquid Crystal token):
<Card variant="liquid-crystal" className="rounded-2xl text-white">
  {/* Card content */}
</Card>

// Or let it auto-detect from theme:
<Card className="rounded-2xl text-white">
  {/* Card content - automatically uses Liquid Crystal in dark mode, Ceramic in light mode */}
</Card>
```

**Migration Checklist**:
- [ ] Hero section card (Delivery Signals) - migrate to Liquid Crystal token
- [ ] Service cards in Bento Grid - migrate to Liquid Crystal/Ceramic tokens
- [ ] Stats cards - migrate to Liquid Crystal/Ceramic tokens
- [ ] All cards maintain glassmorphism aesthetic through standardized tokens
- [ ] Verify cards work correctly in both light and dark modes

### Step 5: Update Input Component

**File**: `frontend/components/ui/input.tsx`

Update to support inset variant:

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "inset" | "default";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "inset", ...props }, ref) => {
    const inputClasses = variant === "inset" 
      ? "input-inset"
      : "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

    return (
      <input
        type={type}
        className={cn(inputClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### Step 6: Update Button Component

**File**: `frontend/components/ui/button.tsx`

Update primary button hover to scale down:

```typescript
// In the button variants, update primary:
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-teal-500 to-emerald-500 text-primary-foreground shadow-[0_0_20px_-5px_#0FD4C8] hover:brightness-110 active:scale-95",
        // ... other variants
      },
    },
  }
)
```

### Step 7: Create Layout Component

**File**: `frontend/components/layout/Layout.tsx` (new file)

```typescript
"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode;
  isLanding?: boolean;
  contentMaxWidth?: string;
}

export function Layout({ 
  children, 
  isLanding = false,
  contentMaxWidth 
}: LayoutProps) {
  const containerClasses = isLanding
    ? "" // Float layout - no max-width constraint
    : cn("mx-auto px-4 sm:px-6", contentMaxWidth || "max-w-5xl");

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Global Background Effects (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
      </div>

      {/* Main Content Area */}
      <main className={cn("relative z-10 pt-20", containerClasses)}>
        {children}
      </main>
    </div>
  );
}
```

### Step 8: Update Locale Layout

**File**: `frontend/app/[locale]/layout.tsx`

Update to use new Layout component for content pages:

```typescript
// Add import
import { Layout } from "@/components/layout/Layout";

// In the return, wrap children conditionally:
// For landing page (page.tsx), use existing structure
// For content pages, use Layout component

// Example for blog page:
<Layout isLanding={false}>
  <article className="reading-surface rounded-2xl p-8">
    {children}
  </article>
</Layout>
```

### Step 9: Create Badge Component

**File**: `frontend/components/ui/badge.tsx` (new file)

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      color: {
        orange: "border-orange-500/20 text-orange-600 bg-orange-500/5",
        cyan: "border-cyan-500/20 text-cyan-600 bg-cyan-500/5",
        green: "border-green-500/20 text-green-600 bg-green-500/5",
        red: "border-red-500/20 text-red-600 bg-red-500/5",
        blue: "border-blue-500/20 text-blue-600 bg-blue-500/5",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### Step 10: Update Typography in Content Pages

**File**: `frontend/app/[locale]/blog/[slug]/page.tsx` (example)

Apply typography hierarchy:

```typescript
<article className="reading-surface rounded-2xl p-8">
  <h1 className="text-4xl font-bold text-foreground mb-4">
    {/* H1 can have gradients */}
  </h1>
  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
    {/* H2-H6: solid colors only */}
  </h2>
  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
    {/* Body text with reduced contrast */}
  </p>
</article>
```

### Step 11: Update Link Styling

**File**: `frontend/app/globals.css`

Add prose link styling:

```css
/* Prose Links */
.prose a {
  @apply border-b border-teal-500/30 text-teal-600 dark:text-teal-400 hover:border-teal-500 transition-colors;
}
```

## Testing Checklist

- [ ] **Homepage cards migrated to standardized tokens** (Liquid Crystal/Ceramic)
- [ ] Cards render correctly in light mode (Ceramic)
- [ ] Cards render correctly in dark mode (Liquid Crystal)
- [ ] Reading surfaces are opaque (95%+) in dark mode
- [ ] Inputs have inset/engraved appearance
- [ ] Buttons scale down on hover (not up)
- [ ] Layout component switches between float/anchored modes
- [ ] WCAG AA contrast ratios pass validation
- [ ] Backdrop-blur fallback works in unsupported browsers
- [ ] Theme switching works smoothly
- [ ] Typography hierarchy is consistent

## Next Steps

After implementation:
1. Test on multiple devices and browsers
2. Validate WCAG AA contrast compliance
3. Test theme switching
4. Verify PageSpeed scores remain 95+
5. Update existing pages to use new components
