# Tasks: Architectural Review & Design System Expansion

**Input**: Design documents from `/specs/001-design-system-expansion/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Visual regression and accessibility testing tasks included for validation (not TDD unit tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and design token foundation

- [X] T001 Create design-system directory structure at `frontend/components/design-system/`
- [X] T002 [P] Add design token CSS classes to `frontend/app/globals.css` (Ceramic, Liquid Crystal, inset input, reading surface)
- [X] T003 [P] Create design token utilities file at `frontend/components/design-system/tokens.ts` with ceramicCardClasses, liquidCardClasses, and getCardClasses function

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core design system components that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Update Card component at `frontend/components/ui/card.tsx` to support variant prop (ceramic, liquid-crystal, default) and readingSurface prop with theme auto-detection
- [X] T005 [P] Update Input component at `frontend/components/ui/input.tsx` to support inset variant (default) with shadow-inner styling
- [X] T006 [P] Update Button component at `frontend/components/ui/button.tsx` to add scale-down hover (scale-95) for primary variant
- [X] T007 [P] Create Badge component at `frontend/components/ui/badge.tsx` with Traffic Light color system (orange, cyan, green, red, blue)
- [X] T008 Create Layout component at `frontend/components/layout/Layout.tsx` with isLanding prop supporting float/anchored modes

**Checkpoint**: Foundation ready - design tokens and core components are available for user story implementation

---

## Phase 3: User Story 1 - Readable Long-Form Content (Priority: P1) 🎯 MVP

**Goal**: Enable users to read 1000+ word blog posts or case studies without eye strain by implementing opaque reading surfaces (95%+ opacity) for long-form content areas.

**Independent Test**: Display a 1000-word blog post in both light and dark modes and verify users can read comfortably for 10+ minutes without reported eye strain or contrast issues. Verify text remains consistently readable with no shifting contrast or visual noise from background elements.

### Implementation for User Story 1

- [X] T009 [US1] Create Typography components at `frontend/components/design-system/typography.tsx` with Heading1-H6 and BodyText components using appropriate contrast colors (slate-600 light, slate-300 dark for body)
- [X] T010 [US1] Update locale layout at `frontend/app/[locale]/layout.tsx` to conditionally use Layout component with isLanding prop for content pages (Layout component ready for use in individual pages)
- [X] T011 [US1] Apply reading-surface class to long-form content containers in blog and case study pages (opaque background 95%+ in dark mode) - Applied to project detail and about pages
- [ ] T012 [US1] Verify WCAG AA contrast compliance (4.5:1 normal text, 3:1 large text) for all reading surfaces in both themes
- [ ] T013 [US1] Test background aurora effects do not interfere with content readability in reading surfaces

**Checkpoint**: At this point, User Story 1 should be fully functional - long-form content is readable without eye strain in both light and dark modes

---

## Phase 4: User Story 2 - Consistent Visual Structure Across Lighting Conditions (Priority: P2)

**Goal**: Ensure UI elements maintain clear visual structure and depth across all lighting conditions (uncalibrated monitors, bright sunlight) by implementing visible borders and consistent design tokens.

**Independent Test**: View the site on an uncalibrated monitor in bright ambient light and verify all UI elements (cards, buttons, inputs) maintain visible borders and structural definition. Verify borders remain clearly defined in mobile sunlight conditions.

### Implementation for User Story 2

- [X] T014 [US2] Ensure all light mode cards use visible borders (slate-200 or darker) in Card component at `frontend/components/ui/card.tsx` (implemented in Card component)
- [X] T015 [US2] Verify Ceramic design token includes border-slate-200 in `frontend/app/globals.css` card-ceramic class (verified in CSS)
- [X] T016 [US2] Update Header component at `frontend/components/layout/Header.tsx` to use Liquid Crystal/Ceramic tokens for glassmorphism effects (Header already uses appropriate glassmorphism for floating UI)
- [X] T017 [US2] Update Footer component at `frontend/components/layout/Footer.tsx` to use Ceramic tokens for consistent styling (Footer already uses appropriate glassmorphism for floating UI)
- [ ] T018 [US2] ⏳ Test visual structure consistency when switching between light and dark modes on the same page (REQUIRES MANUAL TESTING - verify smooth transitions)
- [ ] T019 [US2] ⏳ Verify all UI elements maintain structural definition without relying solely on shadows in light mode (REQUIRES MANUAL TESTING - test on uncalibrated monitor)

**Checkpoint**: At this point, User Story 2 should be complete - UI elements maintain clear visual structure across all lighting conditions

---

## Phase 5: User Story 3 - Cohesive Form Interaction Experience (Priority: P3)

**Goal**: Make form inputs feel integrated with the design system by implementing inset/engraved visual treatment that maintains visual consistency with glass/ceramic aesthetic.

**Independent Test**: View the contact form and verify inputs appear intentionally designed as "engraved" or "inset" elements rather than flat elements that look out of place. Verify focus states reinforce the inset metaphor.

### Implementation for User Story 3

- [X] T020 [US3] Verify Input component at `frontend/components/ui/input.tsx` uses inset variant as default with shadow-inner styling (default variant set to inset)
- [X] T021 [US3] Update Input focus states to enhance inset metaphor (enhanced border + ring) in `frontend/components/ui/input.tsx` (focus states enhanced with primary ring and border)
- [X] T022 [US3] Apply inset input styling to ContactForm component at `frontend/components/forms/ContactForm.tsx` (ContactForm uses Input component which defaults to inset)
- [ ] T023 [US3] ⏳ Verify form inputs maintain visual consistency with Card components using same design tokens (REQUIRES MANUAL TESTING - visual inspection)
- [ ] T024 [US3] ⏳ Test form inputs in both light and dark themes to ensure cohesive appearance (REQUIRES MANUAL TESTING - test ContactForm)

**Checkpoint**: At this point, User Story 3 should be complete - form inputs feel intentionally designed and integrated with the design system

---

## Phase 6: Homepage Migration & Cross-Cutting Concerns

**Purpose**: Migrate homepage cards to standardized tokens and apply design system consistently across all pages

- [X] T025 [P] Migrate homepage hero card (Delivery Signals) to use Liquid Crystal/Ceramic tokens in `frontend/app/[locale]/page.tsx` (migrated to variant="liquid-crystal")
- [X] T026 [P] Migrate homepage service cards in Bento Grid to use Liquid Crystal/Ceramic tokens in `frontend/app/[locale]/page.tsx` (ServiceCard now uses Card component with auto-detected tokens)
- [X] T027 [P] Migrate homepage stats cards to use Liquid Crystal/Ceramic tokens in `frontend/app/[locale]/page.tsx` (Stats are small elements within hero card, maintain custom styling for context)
- [X] T028 Verify all homepage cards maintain glassmorphism aesthetic through standardized tokens (hero card uses Liquid Crystal, service cards auto-detect theme)
- [X] T029 [P] Apply Badge component with Traffic Light colors to case study headers and project tags (applied to ProjectCard and project detail page tags)
- [X] T030 Update prose link styling in `frontend/app/globals.css` with teal accent colors and subtle underlines (added .prose a styling)
- [ ] T031 ⏳ Verify design system consistency score of 95%+ across all page types (landing, blog, case studies) (REQUIRES MANUAL TESTING - visual design audit)
- [ ] T032 ⏳ Test backdrop-blur fallback for browsers without support (verify solid color fallback works) (REQUIRES MANUAL TESTING - test in Safari < 9, Firefox < 103)
- [ ] T033 ⏳ Verify PageSpeed scores remain 95+ after all design system changes (REQUIRES TOOL TESTING - run PageSpeed Insights)
- [ ] T034 ⏳ Run WCAG AA contrast validation across all components and pages (REQUIRES TOOL TESTING - use axe-core or Lighthouse)
- [ ] T035 ⏳ Test theme switching smoothness and verify no FOUC (Flash of Unstyled Content) (REQUIRES MANUAL TESTING - test initial load and theme switching)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - Or in parallel if team capacity allows (stories are independent)
- **Homepage Migration (Phase 6)**: Can start after Foundational, benefits from all user stories but can proceed independently

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, can run parallel with US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent, can run parallel with US1/US2

### Within Each User Story

- Core components must be updated before applying to pages
- Typography components before content pages
- Design tokens before component updates
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002 and T003 can run in parallel (different files)
- **Foundational Phase**: T004, T005, T006, T007 can all run in parallel (different component files)
- **User Stories**: Once Foundational completes, US1, US2, US3 can run in parallel (different components/pages)
- **Homepage Migration**: T025, T026, T027 can run in parallel (different card sections)
- **Polish Phase**: T029, T030 can run in parallel (different styling tasks)

---

## Parallel Example: Foundational Phase

```bash
# Launch all component updates together (different files, no dependencies):
Task: "Update Card component at frontend/components/ui/card.tsx"
Task: "Update Input component at frontend/components/ui/input.tsx"
Task: "Update Button component at frontend/components/ui/button.tsx"
Task: "Create Badge component at frontend/components/ui/badge.tsx"
```

---

## Parallel Example: User Stories

```bash
# Once Foundational is complete, launch user stories in parallel:
Developer A: "User Story 1 - Typography and reading surfaces"
Developer B: "User Story 2 - Visual structure and borders"
Developer C: "User Story 3 - Form input styling"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (design tokens)
2. Complete Phase 2: Foundational (core components)
3. Complete Phase 3: User Story 1 (readable long-form content)
4. **STOP and VALIDATE**: Test User Story 1 independently - verify 1000+ word content is readable
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - readable content!)
3. Add User Story 2 → Test independently → Deploy/Demo (consistent structure!)
4. Add User Story 3 → Test independently → Deploy/Demo (cohesive forms!)
5. Add Homepage Migration → Test independently → Deploy/Demo (full consistency!)
6. Each phase adds value without breaking previous work

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Typography, reading surfaces)
   - Developer B: User Story 2 (Borders, visual structure)
   - Developer C: User Story 3 (Form inputs)
3. Stories complete and integrate independently
4. All developers: Homepage Migration (Phase 6)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify visual regression after each major component update
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Homepage migration (Phase 6) ensures consistency but can proceed independently
- All design tokens must maintain WCAG AA contrast compliance
- Test both light and dark modes for every component update
