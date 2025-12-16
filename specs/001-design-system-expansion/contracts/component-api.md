# Component API Contracts: Design System Expansion

**Feature**: Architectural Review & Design System Expansion  
**Date**: 2025-01-27  
**Phase**: Phase 1 - Design

## Component Interfaces

### Layout Component

**File**: `frontend/components/layout/Layout.tsx`

**Props**:
```typescript
interface LayoutProps {
  children: React.ReactNode;
  isLanding?: boolean; // Default: false
  contentMaxWidth?: string; // Default: "max-w-5xl" for anchored, null for float
}
```

**Behavior**:
- If `isLanding={true}`: Uses float layout (full width, cards float over background)
- If `isLanding={false}`: Uses anchored layout (max-width container, opaque reading surface)
- Renders global background effects (auroras/blobs) as fixed elements
- Applies appropriate padding and spacing based on mode

**Usage**:
```tsx
// Landing page
<Layout isLanding={true}>
  <BentoGrid />
</Layout>

// Content page
<Layout isLanding={false}>
  <Article content={...} />
</Layout>
```

---

### Card Component (Enhanced)

**File**: `frontend/components/ui/card.tsx`

**Props**:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ceramic" | "liquid-crystal" | "default"; // Auto-detected from theme if not specified
  readingSurface?: boolean; // If true, uses opaque background (95%+)
}
```

**Variants**:
- **ceramic**: Light mode styling (white background, slate-200 border, soft shadow)
- **liquid-crystal**: Dark mode styling (semi-transparent, backdrop-blur, glow effect)
- **default**: Auto-detects from theme context

**Behavior**:
- Automatically applies correct variant based on theme if `variant` not specified
- If `readingSurface={true}`, overrides opacity to 95%+ for readability
- Maintains all existing Card sub-components (CardHeader, CardContent, etc.)
- **Homepage Migration**: All homepage cards MUST use standardized Liquid Crystal/Ceramic tokens (per clarification) to maintain consistency with global application style

**Usage**:
```tsx
// Auto-detected variant
<Card>
  <CardHeader>Title</CardHeader>
</Card>

// Explicit variant
<Card variant="ceramic">
  <CardContent>Content</CardContent>
</Card>

// Reading surface (opaque)
<Card readingSurface={true}>
  <Article>Long-form content</Article>
</Card>
```

---

### Input Component (Enhanced)

**File**: `frontend/components/ui/input.tsx`

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "inset" | "default"; // Default: "inset"
}
```

**Variants**:
- **inset**: Engraved appearance (inner shadow, muted background, border)
- **default**: Standard input (backward compatibility)

**Behavior**:
- `variant="inset"` applies engraved styling with `shadow-inner`
- Maintains focus states and accessibility
- Works in both light and dark themes

**Usage**:
```tsx
// Inset input (default)
<Input type="text" placeholder="Name" />

// Standard input (backward compatibility)
<Input variant="default" type="email" />
```

---

### Button Component (Enhanced)

**File**: `frontend/components/ui/button.tsx`

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  // Existing variants maintained
}
```

**Enhancements**:
- Primary button: Gradient styling (teal-to-emerald)
- Hover: Brightness increase + scale down to 95% (`scale-95`)
- Active: Maintains scale-down for tactile feedback

**Behavior**:
- Differentiates from card lift interactions (cards scale up, buttons scale down)
- Maintains all existing variants for backward compatibility

**Usage**:
```tsx
<Button variant="primary">Submit</Button>
```

---

### Badge Component (New)

**File**: `frontend/components/ui/badge.tsx`

**Props**:
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: "orange" | "cyan" | "green" | "red" | "blue"; // Traffic Light system
  children: React.ReactNode;
}
```

**Styling**:
- Transparent background (`bg-{color}-500/5`)
- Colored border (`border-{color}-500/20`)
- Colored text (`text-{color}-600`)
- Pill shape (rounded-full)

**Usage**:
```tsx
<Badge color="orange">Bitrix</Badge>
<Badge color="cyan">React</Badge>
```

---

### Typography Components (New)

**File**: `frontend/components/design-system/typography.tsx`

**Components**:
- `Heading1`: Hero titles (allows gradients)
- `Heading2` through `Heading6`: Content headings (solid colors only)
- `BodyText`: Body text with appropriate contrast colors

**Props**:
```typescript
interface HeadingProps {
  children: React.ReactNode;
  gradient?: boolean; // Only allowed for H1
  className?: string;
}
```

**Behavior**:
- H2-H6: Always use solid colors (slate-900 light, white dark)
- H1: Can use gradients for hero sections
- Body: Uses slate-600 (light) or slate-300 (dark) for reduced contrast

**Usage**:
```tsx
<Heading1 gradient>Welcome</Heading1>
<Heading2>Article Title</Heading2>
<BodyText>Article content...</BodyText>
```

---

### Design Token Utilities

**File**: `frontend/components/design-system/tokens.ts`

**Exports**:
```typescript
// CSS class utilities
export const ceramicCard = "card-ceramic";
export const liquidCard = "card-liquid";
export const insetInput = "input-inset";

// Tailwind utility combinations
export const ceramicStyles = {
  base: "bg-white",
  border: "border border-slate-200",
  shadow: "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  ring: "ring-1 ring-white/50",
};

export const liquidStyles = {
  base: "bg-slate-900/60",
  backdrop: "backdrop-blur-xl",
  border: "border border-white/10",
  shadow: "shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)]",
  gradient: "bg-gradient-to-b from-white/5 to-transparent",
};
```

---

## CSS Classes Contract

### Ceramic Card Class

**Definition**: `frontend/app/globals.css`

```css
.card-ceramic {
  @apply bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50;
}
```

### Liquid Crystal Card Class

**Definition**: `frontend/app/globals.css`

```css
.card-liquid {
  background-color: rgb(15 23 42 / 0.95); /* Fallback */
}

@supports (backdrop-filter: blur(16px)) {
  .card-liquid {
    @apply bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_15px_-3px_rgba(15,212,200,0.1)];
    background-image: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
  }
}
```

### Inset Input Class

**Definition**: `frontend/app/globals.css`

```css
.input-inset {
  @apply bg-muted/50 border border-border shadow-inner;
}
```

---

## Theme Integration

All components automatically adapt to theme changes via:
- `next-themes` ThemeProvider context
- Tailwind `dark:` prefix utilities
- CSS custom properties for colors

**Theme Detection**:
```typescript
import { useTheme } from "next-themes";

const { theme } = useTheme(); // "light" | "dark" | "system"
```

---

## Backward Compatibility

- All existing component props maintained
- Default behaviors preserved
- New variants are opt-in (except Input which defaults to inset)
- Existing pages continue to work without changes
- **Homepage Migration Required**: Homepage cards must migrate from custom glassmorphism (`bg-white/5 backdrop-blur`) to standardized Liquid Crystal/Ceramic tokens for consistency

---

## Accessibility Requirements

- All components maintain WCAG AA contrast ratios
- Focus states clearly visible
- Keyboard navigation supported
- Screen reader labels preserved
- ARIA attributes maintained
