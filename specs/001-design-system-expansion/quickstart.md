# Quickstart Guide: Architectural Review & Design System Expansion

**Date**: 2025-01-27  
**Feature**: 001-design-system-expansion  
**Status**: Complete

## Overview

This quickstart guide provides step-by-step instructions for implementing the design system expansion and homepage enhancements. Follow these steps in order to ensure proper implementation.

---

## Prerequisites

- ✅ Next.js 16.0.8+ installed
- ✅ React 19.2.1+ installed
- ✅ Framer Motion ^11.0.0 installed
- ✅ Tailwind CSS ^4 installed
- ✅ next-themes ^0.4.6 installed
- ✅ next-intl ^4.5.8 installed

---

## Phase 1: Design Token Implementation

### Step 1.1: Verify Design Token Utilities

**File**: `frontend/components/design-system/tokens.ts`

Verify that `ceramicCardClasses`, `liquidCardClasses`, and `getCardClasses` are implemented:

```typescript
export const ceramicCardClasses = "bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50";

export const liquidCardClasses = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)] bg-gradient-to-b from-white/5 to-transparent";

export const getCardClasses = (isDark: boolean, readingSurface?: boolean) => {
  if (readingSurface) {
    return "bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10";
  }
  return isDark ? liquidCardClasses : ceramicCardClasses;
};
```

**Status**: ✅ Already implemented

---

### Step 1.2: Verify CSS Classes in globals.css

**File**: `frontend/app/globals.css`

Verify that design token CSS classes are defined:

- `.card-ceramic`
- `.card-liquid` (with `@supports` fallback)
- `.input-inset`
- `.reading-surface`
- `.prose a` (for prose links)

**Status**: ✅ Already implemented

---

## Phase 2: Component Updates

### Step 2.1: Update Card Component

**File**: `frontend/components/ui/card.tsx`

**Changes Required**:
1. ✅ Already uses `useTheme()` for SSR-safe theme detection
2. ✅ Already supports `variant` and `readingSurface` props
3. ✅ Already uses `getCardClasses` utility

**Status**: ✅ Already implemented

---

### Step 2.2: Update Input Component

**File**: `frontend/components/ui/input.tsx`

**Changes Required**:
1. ✅ Already supports `variant="inset"` as default
2. ✅ Already applies `input-inset` class
3. ✅ Already has enhanced focus states

**Status**: ✅ Already implemented

---

### Step 2.3: Update Textarea Component

**File**: `frontend/components/ui/textarea.tsx`

**Changes Required**:
1. ✅ Already applies `input-inset` styling
2. ✅ Already has enhanced focus states

**Status**: ✅ Already implemented

---

### Step 2.4: Update Button Component

**File**: `frontend/components/ui/button.tsx`

**Changes Required**:
1. ✅ Already has `variant="primary"` with gradient styling
2. ✅ Already has tactile hover feedback (`scale-95`)

**Status**: ✅ Already implemented

---

## Phase 3: Animation Components

### Step 3.1: Create TypewriterEffect Component

**File**: `frontend/components/animations/TypewriterEffect.tsx`

**Implementation**:
```typescript
"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterEffectProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterEffect({ 
  text, 
  delay = 50, 
  onComplete,
  className 
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, delay)
      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [displayedText, text, delay, isComplete, onComplete])

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </motion.span>
  )
}
```

**Status**: ⏳ TODO

---

### Step 3.2: Create CounterAnimation Component

**File**: `frontend/components/animations/CounterAnimation.tsx`

**Implementation**:
```typescript
"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CounterAnimationProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function CounterAnimation({ 
  value, 
  duration = 1.5,
  format = (v) => v.toString(),
  className 
}: CounterAnimationProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(count, value, { duration })
    return controls.stop
  }, [count, value, duration])

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [rounded])

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false

  if (prefersReducedMotion) {
    return <span className={className}>{format(value)}</span>
  }

  return (
    <motion.span className={cn("inline-block", className)}>
      {format(displayValue)}
    </motion.span>
  )
}
```

**Status**: ⏳ TODO

---

### Step 3.3: Create StaggeredScroll Component

**File**: `frontend/components/animations/StaggeredScroll.tsx`

**Implementation**:
```typescript
"use client"

import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface StaggeredScrollProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggeredScroll({ 
  children, 
  staggerDelay = 0.1,
  className 
}: StaggeredScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false

  if (prefersReducedMotion || !isVisible) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}
```

**Status**: ⏳ TODO

---

### Step 3.4: Create ParallaxImage Component

**File**: `frontend/components/animations/ParallaxImage.tsx`

**Implementation**:
```typescript
"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image, { ImageProps } from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface ParallaxImageProps extends Omit<ImageProps, "ref"> {
  intensity?: number;
}

export function ParallaxImage({ 
  intensity = 0.5,
  className,
  ...props 
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * intensity])

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false

  if (prefersReducedMotion) {
    return (
      <div className={cn("relative", className)}>
        <Image {...props} />
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }}>
        <Image {...props} />
      </motion.div>
    </div>
  )
}
```

**Status**: ⏳ TODO

---

## Phase 4: Homepage Enhancements

### Step 4.1: Extract Hero Section Component

**File**: `frontend/components/home/HeroSection.tsx`

**Tasks**:
1. Extract hero section from `page.tsx` to separate component
2. Add typewriter effect to code block
3. Add counter animations to Stats metrics
4. Add aurora rotation animation
5. Add scroll behavior (scale + sticky)

**Status**: ⏳ TODO

---

### Step 4.2: Extract Stack Section Component

**File**: `frontend/components/home/StackSection.tsx`

**Tasks**:
1. Extract Stack section from `page.tsx` to separate component
2. Add technology categories with color coding
3. Add tooltips with application descriptions
4. Add pause/play button for marquee
5. Add statistics count display

**Status**: ⏳ TODO

---

### Step 4.3: Extract Services Grid Component

**File**: `frontend/components/home/ServicesGrid.tsx`

**Tasks**:
1. Extract Services section from `page.tsx` to separate component
2. Wrap Service cards with StaggeredScroll component
3. Add typewriter effect to Service Card 1 code block

**Status**: ⏳ TODO

---

### Step 4.4: Enhance Featured Projects

**File**: `frontend/components/portfolio/ProjectCard.tsx`

**Tasks**:
1. Add terminal-style metrics to footer
2. Add code preview on hover
3. Replace Image with ParallaxImage component

**Status**: ⏳ TODO

---

### Step 4.5: Enhance ContactForm

**File**: `frontend/components/forms/ContactForm.tsx`

**Tasks**:
1. Add trust indicators section
2. Add alternative contact methods (email, Telegram)
3. Ensure progressive enhancement (native form fallback)

**Status**: ⏳ TODO

---

## Phase 5: Testing & Validation

### Step 5.1: Visual Testing

- [ ] Test all animations in both light and dark modes
- [ ] Verify prefers-reduced-motion support
- [ ] Test on mobile devices
- [ ] Verify WCAG AA contrast ratios

### Step 5.2: Performance Testing

- [ ] Verify PageSpeed scores remain 95+
- [ ] Test lazy loading with intersection observer
- [ ] Verify GPU-accelerated animations (60fps)
- [ ] Test form submission without JavaScript

### Step 5.3: Accessibility Testing

- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify ARIA labels
- [ ] Test pause/play button functionality

---

## Implementation Order

1. ✅ Design tokens (already implemented)
2. ✅ Component updates (already implemented)
3. ⏳ Animation components (create new components)
4. ⏳ Homepage enhancements (extract and enhance sections)
5. ⏳ Testing & validation

---

## Notes

- All new components should be client components (`"use client"`)
- All text content should use i18n keys (next-intl)
- All animations must respect `prefers-reduced-motion`
- All components should maintain existing functionality while adding enhancements
