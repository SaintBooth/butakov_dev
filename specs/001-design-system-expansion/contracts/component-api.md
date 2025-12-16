# Component API Contracts: Architectural Review & Design System Expansion

**Date**: 2025-01-27  
**Feature**: 001-design-system-expansion  
**Status**: Complete

## Overview

This document defines the component API contracts for all new and modified components in the design system expansion. All components follow React/TypeScript patterns and extend standard HTML element props for accessibility.

---

## Layout Components

### Layout

**File**: `frontend/components/layout/Layout.tsx`

**Props**:
```typescript
interface LayoutProps {
  children: ReactNode;
  isLanding?: boolean; // Default: false
  contentMaxWidth?: string; // Default: "max-w-5xl"
}
```

**Behavior**:
- If `isLanding={true}`: Applies float layout (no max-width constraint)
- If `isLanding={false}`: Applies anchored layout (max-width constraint, centered)
- Renders global background effects (auroras/blobs) as fixed elements
- Applies appropriate padding and spacing

**Usage**:
```tsx
<Layout isLanding={true}>
  {/* Homepage content */}
</Layout>

<Layout isLanding={false} contentMaxWidth="max-w-4xl">
  {/* Blog post content */}
</Layout>
```

---

## Design System Components

### Card

**File**: `frontend/components/ui/card.tsx`

**Props**:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ceramic" | "liquid-crystal" | "default"; // Default: "default"
  readingSurface?: boolean; // Default: false
}
```

**Behavior**:
- `variant="ceramic"`: Forces Ceramic (light mode) styling
- `variant="liquid-crystal"`: Forces Liquid Crystal (dark mode) styling
- `variant="default"`: Auto-detects theme and applies appropriate token
- `readingSurface={true}`: Applies opaque background (95%+ opacity) for long-form content
- Uses `useTheme()` from `next-themes` for SSR-safe theme detection

**Usage**:
```tsx
<Card variant="liquid-crystal">
  {/* Glassmorphism card */}
</Card>

<Card readingSurface={true}>
  {/* Opaque reading surface */}
</Card>
```

---

### Input

**File**: `frontend/components/ui/input.tsx`

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "inset" | "default"; // Default: "inset"
}
```

**Behavior**:
- `variant="inset"`: Applies "engraved" styling with `shadow-inner`
- `variant="default"`: Standard input styling
- Enhanced focus states for inset variant (border + ring)
- Maintains all standard HTML input attributes

**Usage**:
```tsx
<Input variant="inset" type="text" placeholder="Name" />
<Input variant="default" type="email" />
```

---

### Textarea

**File**: `frontend/components/ui/textarea.tsx`

**Props**:
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // No additional props, uses inset styling by default
}
```

**Behavior**:
- Applies `input-inset` styling by default
- Enhanced focus states (consistent with Input component)
- Maintains all standard HTML textarea attributes

**Usage**:
```tsx
<Textarea placeholder="Message" rows={5} />
```

---

### Button

**File**: `frontend/components/ui/button.tsx`

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"; // Default: "default"
  // ... other existing variants
}
```

**Behavior**:
- `variant="primary"`: Gradient styling with glow effect, tactile hover feedback (brightness + scale)
- Other variants: Existing behavior maintained
- Hover: `brightness-110` + `scale-95` for primary variant

**Usage**:
```tsx
<Button variant="primary">Submit</Button>
<Button variant="outline">Cancel</Button>
```

---

### Badge

**File**: `frontend/components/ui/badge.tsx`

**Props**:
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "orange" | "cyan" | "green" | "red" | "blue"; // Default: "blue"
}
```

**Behavior**:
- Traffic Light color system: transparent background + colored border + colored text
- Theme-aware colors (different shades for light/dark mode)
- Maintains accessibility contrast ratios

**Usage**:
```tsx
<Badge color="cyan">React</Badge>
<Badge color="orange">Bitrix</Badge>
```

---

## Animation Components

### TypewriterEffect

**File**: `frontend/components/animations/TypewriterEffect.tsx`

**Props**:
```typescript
interface TypewriterEffectProps {
  text: string;
  delay?: number; // Delay between characters in ms (Default: 50)
  onComplete?: () => void; // Callback when animation completes
  className?: string;
}
```

**Behavior**:
- Displays text character by character
- Respects `prefers-reduced-motion` (shows full text immediately)
- Triggers `onComplete` callback when animation finishes
- Uses Framer Motion for smooth animation

**Usage**:
```tsx
<TypewriterEffect 
  text="const layout = glass({ radius: 16, blur: 18 })"
  delay={30}
/>
```

---

### CounterAnimation

**File**: `frontend/components/animations/CounterAnimation.tsx`

**Props**:
```typescript
interface CounterAnimationProps {
  value: number;
  duration?: number; // Animation duration in seconds (Default: 1.5)
  format?: (value: number) => string; // Custom formatter function
  className?: string;
}
```

**Behavior**:
- Animates from 0 to target value
- Supports custom formatting (e.g., percentages, scores)
- Respects `prefers-reduced-motion` (shows final value immediately)
- Uses Framer Motion for smooth counting

**Usage**:
```tsx
<CounterAnimation 
  value={100} 
  format={(v) => `${v}%`}
/>
<CounterAnimation 
  value={99.9} 
  format={(v) => `${v.toFixed(1)}%`}
/>
```

---

### StaggeredScroll

**File**: `frontend/components/animations/StaggeredScroll.tsx`

**Props**:
```typescript
interface StaggeredScrollProps {
  children: ReactNode;
  staggerDelay?: number; // Delay between items in seconds (Default: 0.1)
  className?: string;
}
```

**Behavior**:
- Wraps children and applies staggered animation on scroll
- Uses Intersection Observer to detect visibility
- Respects `prefers-reduced-motion` (shows all items immediately)
- Uses Framer Motion's `stagger` prop

**Usage**:
```tsx
<StaggeredScroll staggerDelay={0.1}>
  {serviceCards.map(card => <ServiceCard key={card.id} {...card} />)}
</StaggeredScroll>
```

---

### ParallaxImage

**File**: `frontend/components/animations/ParallaxImage.tsx`

**Props**:
```typescript
interface ParallaxImageProps {
  src: string;
  alt: string;
  intensity?: number; // Parallax intensity (Default: 0.5)
  className?: string;
  // ... Next.js Image props
}
```

**Behavior**:
- Applies parallax effect based on scroll position
- Uses Framer Motion's `useScroll` and `useTransform`
- Respects `prefers-reduced-motion` (no parallax effect)
- Wraps Next.js Image component

**Usage**:
```tsx
<ParallaxImage 
  src="/project-image.jpg" 
  alt="Project"
  intensity={0.3}
/>
```

---

## Homepage Section Components

### HeroSection

**File**: `frontend/components/home/HeroSection.tsx`

**Props**:
```typescript
interface HeroSectionProps {
  badge: string; // i18n key or text
  title: string; // i18n key or text
  subtitle: string; // i18n key or text
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  metrics: {
    lighthouse: number;
    seo: string;
    uptime: string;
  };
  codeBlock: string[]; // Array of code lines
}
```

**Behavior**:
- Renders hero section with Aurora background
- Displays Delivery Signals card with counter animations
- Shows code block with typewriter effect
- Implements scroll behavior (scale + sticky) on scroll
- Uses Liquid Crystal card variant

**Usage**:
```tsx
<HeroSection
  badge={t("hero.badge")}
  title={t("hero.title")}
  subtitle={t("hero.subtitle")}
  ctaPrimary={{ label: t("cta.primary"), href: "/portfolio" }}
  ctaSecondary={{ label: t("cta.secondary"), href: "https://github.com" }}
  metrics={{ lighthouse: 100, seo: "A+", uptime: "99.9%" }}
  codeBlock={["pnpm lint && pnpm test", "Deploying to edge...", "Perf budget: OK"]}
/>
```

---

### StackSection

**File**: `frontend/components/home/StackSection.tsx`

**Props**:
```typescript
interface StackSectionProps {
  title: string; // i18n key or text
  technologies: Array<{
    name: string;
    category: "frontend" | "backend" | "tools";
    description?: string; // For tooltip
  }>;
  showStatistics?: boolean; // Default: true
}
```

**Behavior**:
- Renders marquee with technology badges
- Applies category-based color coding
- Shows tooltips on hover with application descriptions
- Implements pause on hover functionality
- Displays pause/play button for accessibility
- Shows statistics count below marquee

**Usage**:
```tsx
<StackSection
  title={t("stack.title")}
  technologies={[
    { name: "Next.js", category: "frontend", description: "SSR, SEO, Performance" },
    { name: "Django", category: "backend", description: "REST API, Admin" },
    // ...
  ]}
/>
```

---

### ServicesGrid

**File**: `frontend/components/home/ServicesGrid.tsx`

**Props**:
```typescript
interface ServicesGridProps {
  services: Array<{
    id: string;
    title: string; // i18n key or text
    icon: ReactNode;
    span: 1 | 2;
    content: ReactNode; // Custom content for each service card
  }>;
}
```

**Behavior**:
- Renders Bento Grid layout
- Applies staggered scroll animations
- Uses Card component with auto-detected theme
- Respects `prefers-reduced-motion`

**Usage**:
```tsx
<ServicesGrid
  services={[
    {
      id: "1",
      title: t("services.fullstack"),
      icon: <Terminal />,
      span: 2,
      content: <CodeBlock code={codeExample} />
    },
    // ...
  ]}
/>
```

---

### ContactForm

**File**: `frontend/components/forms/ContactForm.tsx`

**Props**:
```typescript
interface ContactFormProps {
  title?: string; // i18n key or text
  subtitle?: string; // i18n key or text
  showTrustIndicators?: boolean; // Default: true
  showAlternativeContacts?: boolean; // Default: true
}
```

**Behavior**:
- Renders contact form with progressive enhancement
- Uses native HTML form with `action` attribute (works without JS)
- Enhances with React Hook Form when JS available
- Displays trust indicators (response time, privacy)
- Shows alternative contact methods (email, Telegram)
- Uses inset input styling

**Usage**:
```tsx
<ContactForm
  title={t("contact.title")}
  subtitle={t("contact.subtitle")}
  showTrustIndicators={true}
  showAlternativeContacts={true}
/>
```

---

## Project Components

### ProjectCard (Enhanced)

**File**: `frontend/components/portfolio/ProjectCard.tsx`

**Props**:
```typescript
interface ProjectCardProps {
  // ... existing props
  metrics?: {
    lighthouse?: number;
    conversionRate?: number;
    roi?: number;
  };
  codePreview?: string; // Code fragment for hover preview
}
```

**Behavior**:
- Displays terminal-style metrics in footer (if provided)
- Shows code preview on hover (if provided)
- Uses ParallaxImage for project images
- Maintains existing functionality

**Usage**:
```tsx
<ProjectCard
  // ... existing props
  metrics={{
    lighthouse: 100,
    conversionRate: 4.2,
    roi: 180
  }}
  codePreview="const deploy = () => { ... }"
/>
```

---

## Accessibility Contracts

All components MUST:
- Support keyboard navigation
- Include ARIA labels where appropriate
- Respect `prefers-reduced-motion` media query
- Maintain WCAG AA contrast ratios
- Support screen readers with semantic HTML

---

## Error Handling

- Missing props: Components should provide sensible defaults
- Invalid values: Components should validate and fallback gracefully
- Animation failures: Components should degrade to static content
- Theme detection failures: Components should default to light mode

---

## Performance Contracts

- Animations: Must use GPU-accelerated transforms (transform, opacity)
- Images: Must use Next.js Image component with lazy loading
- Intersection Observer: Must cleanup observers on unmount
- Framer Motion: Must use `AnimatePresence` for mount/unmount animations

---

## Notes

- All components are client components (`"use client"`) where needed
- All text content supports i18n via next-intl
- All components extend standard HTML element props for flexibility
- Component APIs are designed for composition and reusability
