# Feature Specification: Project Placeholder Images

**Feature Branch**: `002-project-placeholder-images`  
**Created**: 2025-12-12  
**Status**: Draft  
**Input**: User description: "для проектов, у которых не установлено изображение, нужно ставить заглушку сгенерированную через https://placehold.co/"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Viewing Projects Without Images (Priority: P1)

As a portfolio visitor, I want to see a visually appealing placeholder image for projects that don't have a featured image, so that the portfolio grid looks complete and professional.

**Why this priority**: This is the core functionality - without it, projects without images display broken or empty image slots, creating a poor visual experience.

**Independent Test**: Can be fully tested by viewing the portfolio page with projects that have no `featured_image` set, and verifying placeholder images are displayed consistently.

**Acceptance Scenarios**:

1. **Given** a project exists without a featured image, **When** a visitor views the portfolio page, **Then** a placeholder image from placehold.co is displayed in place of the missing image
2. **Given** a project has a featured image set, **When** a visitor views the portfolio page, **Then** the actual project image is displayed (not the placeholder)
3. **Given** multiple projects without images exist, **When** a visitor views the portfolio page, **Then** each project displays the same consistent placeholder image

---

### User Story 2 - Placeholder Display on Project Detail Page (Priority: P2)

As a visitor viewing a specific project, I want to see a placeholder image if the project has no featured image, so the detail page layout remains consistent and professional.

**Why this priority**: Ensures visual consistency extends to individual project pages, though less critical than the main portfolio grid.

**Independent Test**: Can be tested by navigating to a project detail page for a project without an image and verifying the placeholder is displayed.

**Acceptance Scenarios**:

1. **Given** a project without a featured image, **When** a visitor navigates to that project's detail page, **Then** a placeholder image is displayed in the image area

---

### Edge Cases

- What happens when placehold.co service is unavailable? → System displays a local fallback or gracefully degrades without breaking the layout
- What happens with very slow network connections? → Placeholder should load quickly as it's an external lightweight service (SVG by default)
- What happens in offline mode (PWA)? → Consider caching strategy for placeholder images

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a placeholder image from placehold.co when a project has no `featured_image` set
- **FR-002**: System MUST display the actual project image when `featured_image` is present and valid
- **FR-003**: Placeholder image MUST maintain consistent dimensions matching the expected image slot size
- **FR-004**: Placeholder image MUST be visually appropriate for a professional portfolio (neutral colors, simple design)
- **FR-005**: Placeholder MUST be displayed in both portfolio grid view and project detail page
- **FR-006**: System SHOULD provide a graceful fallback if the placehold.co service is unreachable

### Key Entities

- **Project**: Existing entity with `featured_image` field (ImageField, optional). When this field is null/empty, the placeholder logic activates.

### Non-Functional Requirements

- **NFR-001**: Placeholder images MUST use modern image formats (WebP preferred) to comply with PageSpeed Insights recommendations
- **NFR-002**: Placeholder implementation MUST NOT degrade PageSpeed score below 95
- **NFR-003**: Placeholder images MUST NOT cause Cumulative Layout Shift (CLS > 0)
- **NFR-004**: Placeholder images MUST be optimized through Next.js Image component for automatic format conversion

## Assumptions

- The placeholder image dimensions will match the standard project image aspect ratio used in the portfolio grid (16:9)
- Placeholder colors will use neutral/gray tones to indicate "no image" state without being distracting (works in both light/dark modes)
- The placehold.co URL will be constructed dynamically in the frontend to match the required dimensions
- No changes to the backend data model are required - this is purely a frontend display concern
- placehold.co service has 99.9%+ availability; fallback strategy optional for MVP

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of projects without images display a placeholder image instead of broken/empty image slots
- **SC-002**: Portfolio page loads without any visible image loading errors or broken image icons
- **SC-003**: Visual consistency maintained across all project cards - no layout shifts between projects with and without images
- **SC-004**: Placeholder images load within 500ms under normal network conditions
- **SC-005**: PageSpeed Insights Performance score remains ≥ 95 after implementation
- **SC-006**: Core Web Vitals pass: LCP < 2.5s, CLS = 0, FID < 100ms
- **SC-007**: No "Serve images in next-gen formats" warning in Lighthouse audit
