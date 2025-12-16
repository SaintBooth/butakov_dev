# Feature Specification: Architectural Review & Design System Expansion

**Feature Branch**: `001-design-system-expansion`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "This is the **Architectural Review & Design System Expansion** for `butakov.dev` v2.0.0."

## Clarifications

### Session 2025-01-27

- Q: Should homepage cards use the new standardized design tokens (Ceramic/Liquid Crystal) or maintain their current custom glassmorphism implementation? → A: Homepage cards MUST migrate to use Liquid Crystal (dark mode) / Ceramic (light mode) design tokens to ensure consistency with the global application style per constitution requirements, while maintaining the glassmorphism aesthetic through the standardized tokens.
- Q: Should homepage implement all animations from homepage-architecture.md (typewriter effects, staggered scroll animations, counter animations, aurora rotation, marquee pause on hover, tooltips) or only critical ones? → A: All animations from homepage-architecture.md MUST be implemented: typewriter effects for code blocks, staggered scroll animations for Service cards, counter animations for Stats metrics, aurora rotation animation, marquee pause on hover, and tooltips for tech badges to fully align with the architectural vision.
- Q: Should Featured Projects section implement terminal-style metrics, code preview on hover, and parallax effects on images as described in homepage-architecture.md? → A: All visual elements from homepage-architecture.md MUST be implemented for Featured Projects: terminal-style metrics in footer (e.g., `$ lighthouse --score 100`), code preview on hover showing project code fragments, and parallax effects on project images during scroll to fully align with the architectural vision.
- Q: Should Stack Section implement technology categories with color coding, tooltips with application descriptions, separators, and statistics count as described in homepage-architecture.md? → A: All elements from homepage-architecture.md MUST be implemented for Stack Section: technology categories (Frontend, Backend, Tools) with color coding, tooltips on hover showing application (e.g., "Next.js: SSR, SEO, Performance"), optional separators between categories, and statistics count (e.g., "15+ технологий в стеке") below marquee to fully align with the architectural vision.
- Q: Should Hero section implement scroll behavior (scale 0.98 + sticky on 100vh), trust indicators in ContactForm ("Обычно отвечаю в течение 24 часов", "Конфиденциально и безопасно"), and progressive enhancement (form works without JS) as described in homepage-architecture.md? → A: All elements from homepage-architecture.md MUST be implemented: Hero section scroll behavior with scale transformation and sticky positioning, trust indicators in ContactForm section, and progressive enhancement ensuring form functionality without JavaScript to fully align with the architectural vision.
- Q: Should homepage implement accessibility features (pause/play button for animations, prefers-reduced-motion support) and performance optimizations (lazy loading images with intersection observer, alternative contact methods) as described in homepage-architecture.md? → A: All accessibility and performance features from homepage-architecture.md MUST be implemented: pause/play button for marquee animations, respect for prefers-reduced-motion media query, lazy loading images with intersection observer and placeholder skeletons, and alternative contact methods (email, Telegram) displayed alongside ContactForm to fully align with the architectural vision.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Readable Long-Form Content (Priority: P1)

As a visitor reading blog posts or case studies, I need to read long-form content (1000+ words) without eye strain or visual fatigue, so that I can consume the information effectively and stay engaged with the content.

**Why this priority**: The homepage's glassmorphism design works beautifully for short cards but creates severe readability issues for long-form content. Without addressing this, users will abandon reading case studies and blog posts, directly impacting the site's ability to demonstrate expertise and convert visitors.

**Independent Test**: Can be fully tested by displaying a 1000-word blog post in both light and dark modes and verifying that users can read comfortably for 10+ minutes without reported eye strain or contrast issues.

**Acceptance Scenarios**:

1. **Given** a user is viewing a blog post or case study page, **When** they scroll through 1000+ words of content, **Then** the text remains consistently readable with no shifting contrast or visual noise from background elements
2. **Given** a user is reading long-form content in dark mode, **When** they view the main content area, **Then** the background is opaque (95%+ opacity) or solid, preventing background auroras/blobs from interfering with text readability
3. **Given** a user is reading long-form content in light mode, **When** they view the main content area, **Then** the background maintains sufficient contrast with text to meet accessibility standards (WCAG AA minimum)

---

### User Story 2 - Consistent Visual Structure Across Lighting Conditions (Priority: P2)

As a visitor using the site on various devices and in different lighting conditions (mobile in sunlight, uncalibrated monitors), I need the UI elements to maintain clear visual structure and depth, so that I can navigate and interact with confidence regardless of my viewing environment.

**Why this priority**: The "Ceramic" light mode style relies on subtle shadows that disappear in bright conditions or on uncalibrated displays, causing the UI to appear flat and broken. This creates a poor first impression and reduces trust in the brand.

**Independent Test**: Can be fully tested by viewing the site on an uncalibrated monitor in bright ambient light and verifying that all UI elements (cards, buttons, inputs) maintain visible borders and structural definition.

**Acceptance Scenarios**:

1. **Given** a user views the site in light mode on an uncalibrated monitor, **When** they examine cards and UI elements, **Then** all elements display visible borders (slate-200 or darker) that maintain structural integrity without relying solely on shadows
2. **Given** a user views the site on mobile in bright sunlight, **When** they interact with the interface, **Then** borders and visual hierarchy remain clearly defined, preventing the UI from appearing as a "flat mess"
3. **Given** a user switches between light and dark modes, **When** they view the same page, **Then** the visual structure and depth perception remain consistent and professional in both modes

---

### User Story 3 - Cohesive Form Interaction Experience (Priority: P3)

As a visitor filling out the contact form, I need form inputs to feel integrated with the overall design system, so that the form doesn't appear broken or disconnected from the rest of the site's aesthetic.

**Why this priority**: Solid form inputs can appear like CSS loading errors when placed within a glassmorphism/ceramic design system. This visual disconnect reduces trust and makes users question whether the form will work correctly.

**Independent Test**: Can be fully tested by viewing the contact form and verifying that inputs appear intentionally designed as "engraved" or "inset" elements rather than flat elements that look out of place.

**Acceptance Scenarios**:

1. **Given** a user views the contact form, **When** they examine the input fields, **Then** inputs appear as intentionally "engraved" or "carved into" the surface using inner shadows, maintaining visual consistency with the glass/ceramic aesthetic
2. **Given** a user interacts with form inputs, **When** they focus on an input field, **Then** the visual feedback reinforces the "inset" metaphor and feels cohesive with the overall design language
3. **Given** a user compares form inputs to other UI elements, **When** they view both together, **Then** the inputs feel like a deliberate design choice rather than a styling error

---

### Edge Cases

- What happens when a user views the site on a high-contrast display setting (Windows High Contrast Mode)?
- How does the system handle extremely long blog posts (5000+ words) - does readability remain consistent throughout?
- What happens when background aurora effects fail to load or are disabled - does the layout remain functional?
- How does the system handle users with visual impairments who rely on screen readers - are semantic structures maintained?
- What happens when a user views the site in a browser that doesn't support backdrop-blur - does the design degrade gracefully?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide distinct visual treatments for landing pages (float layout with glassmorphism cards using Liquid Crystal/Ceramic design tokens) versus content pages (anchored layout with opaque reading surfaces)
- **FR-001a**: Homepage cards MUST use standardized Liquid Crystal (dark mode) / Ceramic (light mode) design tokens to maintain consistency with the global application style per constitution requirements
- **FR-002**: System MUST ensure all long-form content areas (blog posts, case studies) use opaque backgrounds (95%+ opacity) in the main reading column to prevent background interference with text readability
- **FR-003**: System MUST apply visible borders (slate-200 or darker) to all light mode UI elements (cards, inputs, containers) to maintain structural definition independent of shadow rendering
- **FR-004**: System MUST implement form inputs with "inset" or "engraved" visual treatment using inner shadows to maintain design system cohesion
- **FR-005**: System MUST provide "Ceramic" design tokens for light mode that include: base surface, texture gradient, depth shadow, visible border, and highlight ring
- **FR-006**: System MUST provide "Liquid Crystal" design tokens for dark mode that include: semi-transparent base, backdrop blur, subtle border, glow effect, and top highlight gradient
- **FR-007**: System MUST implement a global layout component that supports both "float" (landing) and "anchored" (content) layout modes
- **FR-008**: System MUST maintain consistent typography hierarchy with headings (H1-H6) using solid colors (slate-900 in light, white in dark) for content pages, reserving gradients only for hero H1 titles
- **FR-009**: System MUST use body text colors that reduce harsh contrast (slate-600 in light mode, slate-300 in dark mode) for improved readability
- **FR-010**: System MUST implement primary buttons with gradient styling and tactile hover feedback (brightness increase + scale down to 95%) to differentiate from card lift interactions
- **FR-011**: System MUST style text links in prose with teal accent colors, subtle underlines, and smooth opacity transitions on hover
- **FR-012**: System MUST apply consistent badge/tag styling using the "Traffic Light" color system (transparent background + colored border + colored text) across all content types
- **FR-013**: System MUST ensure glassmorphism effects are reserved for floating UI elements (navigation, sidebars, CTAs) only, not main content reading areas
- **FR-014**: System MUST maintain global background effects (auroras/blobs) as fixed elements that persist across route changes without interfering with content readability
- **FR-015**: System MUST implement typewriter effects for code blocks in Hero section and Service Card 1, with sequential appearance of code lines (delay 0.3s per line)
- **FR-016**: System MUST implement staggered scroll animations for Service cards using intersection observer, with cards appearing sequentially (delay 0.1s per card) on scroll
- **FR-017**: System MUST implement counter animations for Stats metrics (Lighthouse, SEO, Uptime) that animate from 0 to target value
- **FR-018**: System MUST implement aurora background rotation animation (rotate-45 animate-spin, duration 20s) for subtle movement
- **FR-019**: System MUST implement marquee pause on hover functionality (animation-play-state: paused) for Stack section
- **FR-020**: System MUST implement tooltips for tech badges in Stack section showing application descriptions (e.g., "Next.js: SSR, SEO, Performance") on hover
- **FR-021**: System MUST implement terminal-style metrics in Featured Projects card footers (e.g., `$ lighthouse --score 100`, `$ conversion-rate 4.2%`, `$ roi +180%`)
- **FR-022**: System MUST implement code preview on hover for Featured Projects cards, showing project code fragments
- **FR-023**: System MUST implement parallax effects on Featured Projects images during scroll
- **FR-024**: System MUST implement technology categories (Frontend, Backend, Tools) with color coding in Stack section
- **FR-025**: System MUST implement statistics count display (e.g., "15+ технологий в стеке") below Stack marquee
- **FR-026**: System MUST implement Hero section scroll behavior with scale transformation (scale 0.98) and sticky positioning (sticky on 100vh) on scroll
- **FR-027**: System MUST implement trust indicators in ContactForm section ("Обычно отвечаю в течение 24 часов", "Конфиденциально и безопасно")
- **FR-028**: System MUST implement progressive enhancement for ContactForm ensuring functionality without JavaScript (fallback to native form submission)
- **FR-029**: System MUST implement pause/play button for marquee animations to allow users to control animation playback
- **FR-030**: System MUST respect prefers-reduced-motion media query for all animations, disabling or reducing motion when user preference is set
- **FR-031**: System MUST implement lazy loading for images using intersection observer with placeholder skeletons
- **FR-032**: System MUST display alternative contact methods (email, Telegram) alongside ContactForm

### Key Entities *(include if feature involves data)*

- **Design Token**: Represents a reusable visual style formula (Ceramic or Liquid Crystal) that defines base surface, texture, depth, borders, and highlights for consistent application across UI components
- **Layout Mode**: Represents the layout strategy (Float for landing pages, Anchored for content pages) that determines content width, positioning, and background treatment
- **Content Type**: Represents different page types (Landing, Blog, Case Study, 404) that require different visual treatments while maintaining design system consistency

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can read 1000+ word blog posts or case studies for 10+ minutes without reporting eye strain or contrast-related visual fatigue (measured via user testing or analytics on scroll depth and time-on-page)
- **SC-002**: All UI elements maintain visible structural definition (borders, depth) when viewed on uncalibrated monitors in bright ambient light conditions (verified through cross-device testing)
- **SC-003**: Design system consistency score of 95%+ across all page types (landing, blog, case studies) as measured by visual design audit comparing component usage and styling
- **SC-004**: Form inputs receive positive feedback in user testing regarding visual integration with overall design (no reports of "broken" or "out of place" appearance)
- **SC-005**: Site maintains WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) in both light and dark modes across all content types
- **SC-006**: Background effects (auroras/blobs) remain visually present but non-intrusive, with zero user reports of background elements interfering with content readability
- **SC-007**: Typography hierarchy is clearly distinguishable with consistent heading styles, achieving 100% compliance with defined color and gradient rules (headings solid, gradients only for hero H1)
- **SC-008**: Interactive elements (buttons, links) provide clear visual feedback with hover states that feel responsive and intentional, achieving 90%+ positive user feedback on interaction quality
- **SC-009**: All animations from homepage-architecture.md are implemented and functional: typewriter effects, staggered scroll animations, counter animations, aurora rotation, marquee pause on hover, tooltips
- **SC-010**: Featured Projects section displays terminal-style metrics, code preview on hover, and parallax effects as specified in homepage-architecture.md
- **SC-011**: Stack section displays technology categories with color coding, tooltips with application descriptions, and statistics count
- **SC-012**: Hero section implements scroll behavior (scale + sticky), ContactForm displays trust indicators, and form works without JavaScript (progressive enhancement)
- **SC-013**: Accessibility features are implemented: pause/play button for animations, prefers-reduced-motion support, lazy loading with intersection observer, alternative contact methods displayed

## Assumptions

- The existing homepage design aesthetic (glassmorphism cards and aurora backgrounds) is successful and should be preserved, but cards MUST migrate to standardized Liquid Crystal/Ceramic design tokens for consistency with the global application style
- Users primarily consume long-form content (blog, case studies) in focused reading sessions, requiring different visual treatment than exploratory browsing
- The site will expand to include Blog and Case Studies pages that require content-heavy layouts
- Design tokens will be abstracted into reusable components or Tailwind utility classes for consistency
- The site supports both light and dark mode themes that users can switch between
- Background effects (auroras/blobs) are rendered as fixed elements that persist across navigation
- The "Traffic Light" badge system (orange for Bitrix, cyan for React, etc.) is already defined and should be consistently applied
- Homepage MUST fully align with homepage-architecture.md specification, implementing all animations, visual elements, interactive features, accessibility optimizations, and performance enhancements described in the architectural document
- Framer Motion library is available for implementing complex animations (typewriter, staggered scroll, parallax)
- Intersection Observer API is available for scroll-triggered animations and lazy loading
- Project data includes metrics (Lighthouse scores, conversion rates, ROI) that can be displayed in terminal-style format

## Dependencies

- Existing homepage design system and component library
- Tailwind CSS utility framework for styling implementation
- React component architecture for layout and component abstraction
- Theme switching system for light/dark mode support
- Content management system or static site generator for blog and case study pages

## Out of Scope

- Creating new content for blog or case studies (only establishing the design system to support them)
- Screen reader optimization beyond basic semantic structures (keyboard navigation improvements are separate concerns)
- Performance optimization of background effects beyond lazy loading (assumed to be handled separately)
- Backend API changes for form submission (progressive enhancement uses existing form action)
