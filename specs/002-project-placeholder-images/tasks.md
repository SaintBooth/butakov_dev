# Tasks: Project Placeholder Images

**Input**: Design documents from `/specs/002-project-placeholder-images/`  
**Prerequisites**: plan.md ✅, spec.md ✅, quickstart.md ✅

**Tests**: Not requested - visual QA and PageSpeed validation only

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- File paths relative to repository root

---

## Phase 1: Setup (Configuration)

**Purpose**: Configure Next.js to support external placeholder images

- [x] T001 Add placehold.co to remotePatterns in `frontend/next.config.ts`
- [x] T002 Create placeholder URL utility in `frontend/lib/placeholder.ts`

**Checkpoint**: Configuration ready - user story implementation can begin

---

## Phase 2: User Story 1 - Portfolio Grid Placeholders (Priority: P1) 🎯 MVP

**Goal**: Display placeholder images for projects without `featured_image` in the portfolio grid

**Independent Test**: View portfolio page with projects that have no image set - placeholders should display consistently

### Implementation for User Story 1

- [x] T003 [US1] Import placeholder utility in `frontend/components/portfolio/ProjectCard.tsx`
- [x] T004 [US1] Update ProjectCard to always render image container (remove conditional) in `frontend/components/portfolio/ProjectCard.tsx`
- [x] T005 [US1] Add fallback to PROJECT_CARD_PLACEHOLDER when featured_image is null in `frontend/components/portfolio/ProjectCard.tsx`

**Checkpoint**: Portfolio grid shows placeholders for all projects without images

---

## Phase 3: User Story 2 - Project Detail Page Placeholders (Priority: P2)

**Goal**: Display placeholder images for projects without `featured_image` on detail pages

**Independent Test**: Navigate to project detail page for a project without image - placeholder should display

### Implementation for User Story 2

- [x] T006 [US2] Import placeholder utility in `frontend/app/[locale]/projects/[slug]/page.tsx`
- [x] T007 [US2] Update detail page to always render image container (remove conditional) in `frontend/app/[locale]/projects/[slug]/page.tsx`
- [x] T008 [US2] Add fallback to PROJECT_DETAIL_PLACEHOLDER when featured_image is null in `frontend/app/[locale]/projects/[slug]/page.tsx`

**Checkpoint**: Project detail pages show placeholders for all projects without images

---

## Phase 4: Polish & Validation

**Purpose**: Verify PageSpeed compliance and visual quality

- [ ] T009 Visual QA: Verify placeholders display correctly in light mode
- [ ] T010 Visual QA: Verify placeholders display correctly in dark mode
- [ ] T011 Visual QA: Verify responsive behavior (mobile, tablet, desktop)
- [ ] T012 Run Lighthouse/PageSpeed audit - verify score ≥ 95
- [ ] T013 Verify CLS = 0 (no layout shifts when images load)
- [ ] T014 Verify no "Serve images in next-gen formats" warning

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────┐
   │                                                   │
   ▼                                                   │
Phase 2 (US1: Portfolio Grid) ◄── MVP COMPLETE ────────┤
   │                                                   │
   ▼                                                   │
Phase 3 (US2: Detail Page) ◄── Can run parallel to US1 │
   │                                                   │
   ▼                                                   │
Phase 4 (Polish) ◄── Requires US1 + US2 complete ──────┘
```

### Task Dependencies

| Task | Depends On | Notes |
|------|------------|-------|
| T001 | - | Can start immediately |
| T002 | - | Can start immediately, parallel with T001 |
| T003-T005 | T001, T002 | User Story 1 implementation |
| T006-T008 | T001, T002 | User Story 2 implementation, can run parallel to US1 |
| T009-T014 | T005, T008 | Validation after implementation |

### Parallel Opportunities

**Setup Phase (T001-T002)**:
```
┌─────────────────────────────────┐
│ T001: Configure next.config.ts  │  ──┐
└─────────────────────────────────┘    │ PARALLEL
┌─────────────────────────────────┐    │
│ T002: Create placeholder.ts     │  ──┘
└─────────────────────────────────┘
```

**User Stories (After Setup)**:
```
┌──────────────────────────────────┐
│ US1: T003 → T004 → T005          │  ──┐
│ (ProjectCard.tsx)                │    │ CAN RUN PARALLEL
└──────────────────────────────────┘    │ (different files)
┌──────────────────────────────────┐    │
│ US2: T006 → T007 → T008          │  ──┘
│ (page.tsx)                       │
└──────────────────────────────────┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete T001-T002 (Setup)
2. ✅ Complete T003-T005 (User Story 1: Portfolio Grid)
3. **STOP and VALIDATE**: Check portfolio page shows placeholders
4. Demo/deploy if ready

### Full Implementation

1. Complete Setup (T001-T002)
2. Complete US1 (T003-T005) → Test portfolio grid
3. Complete US2 (T006-T008) → Test detail pages
4. Complete Polish (T009-T014) → Validate PageSpeed

### Estimated Time

| Phase | Tasks | Time |
|-------|-------|------|
| Setup | T001-T002 | 10 min |
| User Story 1 | T003-T005 | 10 min |
| User Story 2 | T006-T008 | 10 min |
| Polish | T009-T014 | 15 min |
| **Total** | 14 tasks | ~45 min |

---

## Files Changed Summary

| File | Action | Tasks |
|------|--------|-------|
| `frontend/next.config.ts` | Modify | T001 |
| `frontend/lib/placeholder.ts` | Create | T002 |
| `frontend/components/portfolio/ProjectCard.tsx` | Modify | T003-T005 |
| `frontend/app/[locale]/projects/[slug]/page.tsx` | Modify | T006-T008 |

---

## Notes

- This is a small, focused feature with minimal scope
- No backend changes required
- No new dependencies to install
- Tests not included (visual QA + PageSpeed validation instead)
- Each user story is independently testable
- Commit after each phase for clean history
