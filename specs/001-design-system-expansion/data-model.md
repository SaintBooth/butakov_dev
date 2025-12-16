# Data Model: Architectural Review & Design System Expansion

**Date**: 2025-01-27  
**Feature**: 001-design-system-expansion  
**Status**: Complete

## Overview

This feature is primarily frontend-focused and does not introduce new backend data models. However, it defines component-level data structures and prop interfaces for the design system components.

## Component Data Structures

### Design Token

**Type**: TypeScript utility type / CSS class string

**Fields**:
- `ceramicCardClasses`: string - CSS classes for Ceramic (light mode) card styling
- `liquidCardClasses`: string - CSS classes for Liquid Crystal (dark mode) card styling
- `getCardClasses(isDark: boolean, readingSurface?: boolean)`: string - Function returning appropriate card classes based on theme

**Validation Rules**:
- Must include visible borders for light mode (slate-200 or darker)
- Must include backdrop-blur for dark mode (with fallback)
- Must support readingSurface variant for opaque backgrounds

**State Transitions**: N/A (static utility functions)

---

### Layout Mode

**Type**: TypeScript union type

**Values**:
- `"float"` - Landing page layout (no max-width constraint, glassmorphism cards)
- `"anchored"` - Content page layout (max-width constraint, opaque reading surfaces)

**Component**: `Layout` component

**Props**:
```typescript
interface LayoutProps {
  children: ReactNode;
  isLanding?: boolean; // true = float, false = anchored
  contentMaxWidth?: string; // Optional custom max-width
}
```

**Validation Rules**:
- `isLanding` defaults to `false` (anchored mode)
- `contentMaxWidth` defaults to `max-w-5xl` if not provided

---

### Content Type

**Type**: TypeScript union type (implicit)

**Values**:
- `"landing"` - Homepage (uses float layout)
- `"blog"` - Blog post pages (uses anchored layout)
- `"case-study"` - Case study pages (uses anchored layout)
- `"404"` - Error pages (uses anchored layout)

**Usage**: Determines which layout mode and design tokens to apply

---

### Animation State

**Type**: React state / Framer Motion animation state

**Fields**:
- `isVisible`: boolean - Whether element is visible (for intersection observer)
- `isPlaying`: boolean - Whether animation is playing (for pause/play)
- `displayedText`: string - Current displayed text (for typewriter effect)
- `count`: number - Current count value (for counter animation)

**State Transitions**:
- `isVisible`: false → true (on intersection observer trigger)
- `isPlaying`: true ↔ false (on pause/play button click)
- `displayedText`: "" → fullText (character by character)
- `count`: 0 → targetValue (smooth animation)

---

### Technology Category

**Type**: TypeScript union type

**Values**:
- `"frontend"` - Frontend technologies (Next.js, React, TypeScript)
- `"backend"` - Backend technologies (Django, PostgreSQL, Redis)
- `"tools"` - Development tools (Docker, Figma, Yandex.Metrika)

**Component**: Stack Section tech badges

**Props**:
```typescript
interface TechBadgeProps {
  name: string;
  category: "frontend" | "backend" | "tools";
  description?: string; // For tooltip
}
```

**Color Mapping**:
- `frontend`: blue-50 / blue-950/20 (dark)
- `backend`: green-50 / green-950/20 (dark)
- `tools`: purple-50 / purple-950/20 (dark)

---

### Project Metrics

**Type**: TypeScript interface (for terminal-style display)

**Fields**:
- `lighthouseScore`: number | null - Lighthouse performance score (0-100)
- `conversionRate`: number | null - Conversion rate percentage
- `roi`: number | null - ROI percentage

**Component**: Featured Projects card footer

**Props**:
```typescript
interface ProjectMetricsProps {
  lighthouseScore?: number;
  conversionRate?: number;
  roi?: number;
}
```

**Display Format**: Terminal-style strings
- `$ lighthouse --score {lighthouseScore}`
- `$ conversion-rate {conversionRate}%`
- `$ roi +{roi}%`

**Validation Rules**:
- All fields optional (may not be available for all projects)
- Numbers must be valid (0-100 for scores, any positive number for rates)

---

### Trust Indicator

**Type**: TypeScript interface

**Fields**:
- `icon`: ReactNode - Icon component (from lucide-react)
- `text`: string - Trust indicator text (i18n key)

**Component**: ContactForm section

**Props**:
```typescript
interface TrustIndicatorProps {
  icon: ReactNode;
  text: string; // i18n key
}
```

**Values**:
- Response time: "Обычно отвечаю в течение 24 часов" / "Usually respond within 24 hours"
- Privacy: "Конфиденциально и безопасно" / "Confidential and secure"

---

### Contact Method

**Type**: TypeScript interface

**Fields**:
- `type`: "email" | "telegram"
- `href`: string - Contact URL
- `label`: string - Display label (i18n key)

**Component**: Alternative contact methods display

**Props**:
```typescript
interface ContactMethodProps {
  type: "email" | "telegram";
  href: string;
  label: string; // i18n key
}
```

**Values**:
- Email: `mailto:{email}`
- Telegram: `https://t.me/{username}`

---

## Component Props Interfaces

### Card Component

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ceramic" | "liquid-crystal" | "default";
  readingSurface?: boolean;
}
```

### Input Component

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "inset" | "default";
}
```

### Button Component

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  // ... other variants
}
```

### Badge Component

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: "orange" | "cyan" | "green" | "red" | "blue";
}
```

---

## Relationships

1. **Layout → Content Type**: Layout component determines layout mode based on page type
2. **Design Token → Theme**: Design tokens selected based on current theme (light/dark)
3. **Animation State → Component**: Animation state managed per component instance
4. **Technology Category → Badge**: Tech badges display category-based color coding
5. **Project Metrics → Project Card**: Project cards display terminal-style metrics in footer

---

## Data Flow

1. **Theme Detection**: `next-themes` provides current theme → Design tokens selected
2. **Layout Mode**: Page type determines layout mode → Layout component applies appropriate styling
3. **Animation Triggers**: Intersection Observer detects visibility → Animations trigger
4. **Form Submission**: Native form fallback OR React Hook Form enhancement → API submission

---

## Validation Rules Summary

- Design tokens must include visible borders for light mode
- Layout mode must default to "anchored" unless explicitly set to "float"
- Animation states must respect `prefers-reduced-motion`
- Project metrics must handle missing/null values gracefully
- Trust indicators must support i18n translation keys
- Contact methods must have valid hrefs

---

## Notes

- No backend schema changes required (frontend-only feature)
- All data structures are TypeScript interfaces/types
- Component props extend standard HTML element props for accessibility
- i18n keys used for all user-facing text (next-intl)
