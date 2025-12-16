# Data Model: Design System Expansion

**Feature**: Architectural Review & Design System Expansion  
**Date**: 2025-01-27  
**Phase**: Phase 1 - Design

## Overview

This design system expansion does not involve database entities or data persistence. Instead, it defines **design system entities** (design tokens, layout modes, content types) that govern visual presentation and component behavior.

## Design System Entities

### Design Token

**Purpose**: Reusable visual style formula that defines consistent appearance across UI components.

**Variants**:
- **Ceramic** (Light Mode): Tactile, clean, premium aesthetic
- **Liquid Crystal** (Dark Mode): High-tech, glowing, mysterious aesthetic

**Attributes**:
- `baseSurface`: Background color/base
- `texture`: Gradient overlay for sheen/lighting
- `depth`: Shadow for lift/depth perception
- `definition`: Border for structural integrity
- `highlight`: Ring/glow for accent

**Relationships**:
- Applied to: Card, Input, Container components
- Context: Theme mode (light/dark)

**Validation Rules**:
- Must maintain WCAG AA contrast ratios
- Must degrade gracefully without backdrop-blur support
- Must work in both light and dark themes

### Layout Mode

**Purpose**: Layout strategy that determines content width, positioning, and background treatment.

**Variants**:
- **Float**: Landing pages - cards float in open space over background
- **Anchored**: Content pages - text in central column with opaque background

**Attributes**:
- `mode`: "float" | "anchored"
- `maxWidth`: Content container max-width (null for float, "max-w-3xl" for anchored)
- `backgroundOpacity`: Main content area opacity (varies by mode)
- `padding`: Container padding

**Relationships**:
- Applied to: Layout component
- Determines: Content area styling, background visibility

**State Transitions**:
- `float` → `anchored`: When navigating from landing to content page
- `anchored` → `float`: When navigating from content to landing page

### Content Type

**Purpose**: Page type classification that determines which layout mode and design tokens to apply.

**Types**:
- **Landing**: Homepage - uses Float layout, glassmorphism cards
- **Blog**: Blog posts - uses Anchored layout, opaque reading surface
- **Case Study**: Project details - uses Anchored layout, opaque reading surface
- **404**: Error page - uses Anchored layout, opaque reading surface

**Attributes**:
- `type`: "landing" | "blog" | "case-study" | "404"
- `layoutMode`: LayoutMode variant to use
- `requiresReadingSurface`: Boolean - whether opaque reading surface required

**Relationships**:
- Maps to: Layout Mode
- Determines: Design token application

## Component Structure

### Card Component Variants

**Ceramic Card** (Light Mode):
- Base: `bg-white`
- Border: `border-slate-200`
- Shadow: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- Ring: `ring-1 ring-white/50`

**Liquid Crystal Card** (Dark Mode):
- Base: `bg-slate-900/60`
- Backdrop: `backdrop-blur-xl`
- Border: `border-white/10`
- Shadow: `shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)]`
- Gradient: `bg-gradient-to-b from-white/5 to-transparent`

### Input Component Variants

**Inset Input** (Both Themes):
- Background: `bg-muted/50`
- Border: `border-border`
- Shadow: `shadow-inner` (inset shadow)
- Focus: Enhanced border + ring

### Layout Component Props

```typescript
interface LayoutProps {
  children: React.ReactNode;
  isLanding?: boolean; // Determines float vs anchored mode
  contentMaxWidth?: string; // Override default max-width
}
```

## State Management

**Theme State**: Managed by `next-themes` (existing)
- Light mode → Ceramic tokens
- Dark mode → Liquid Crystal tokens

**Layout Mode State**: Determined by page type
- Landing page → `isLanding={true}` → Float mode
- Content pages → `isLanding={false}` → Anchored mode

## Validation Rules

1. **Contrast Compliance**: All text/background combinations must pass WCAG AA (4.5:1 normal, 3:1 large)
2. **Opacity Requirements**: Reading surfaces must be 95%+ opacity in dark mode
3. **Border Requirements**: Light mode elements must have visible borders (slate-200 or darker)
4. **Backdrop Fallback**: All backdrop-blur effects must have solid color fallback
5. **Theme Consistency**: Design tokens must work identically in both light and dark modes

## Edge Cases

- **High Contrast Mode**: Design tokens must maintain structure without relying solely on color
- **No Backdrop-Blur Support**: Fallback to solid backgrounds maintains functionality
- **Extremely Long Content**: Anchored layout ensures readability throughout scroll
- **Theme Switching**: Smooth transition between Ceramic and Liquid Crystal tokens
