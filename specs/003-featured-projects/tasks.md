# Tasks: Featured Projects on Homepage

**Input**: Design documents from `/specs/003-featured-projects/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested - manual E2E testing per spec.

**Organization**: Tasks grouped by user story. US1 and US2 are combined as they share the same component.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths use web app structure: `frontend/`, `backend/`

---

## Phase 1: Setup

**Purpose**: No setup required - using existing project infrastructure

> ✅ **SKIP**: Project structure, dependencies, and API endpoints already exist.
> 
> Existing infrastructure verified:
> - `backend/portfolio/models.py` - Project model with `is_featured` field
> - `backend/portfolio/views.py` - API supports `?featured=true` filter
> - `frontend/components/portfolio/ProjectCard.tsx` - Reusable card component
> - `frontend/components/portfolio/BentoGrid.tsx` - Reusable grid layout

---

## Phase 2: Foundational (API Client Update)

**Purpose**: Extend API client to support fetching featured projects

- [x] T001 Add `fetchFeaturedProjects` function in `frontend/lib/api.ts`

**Checkpoint**: API client ready for featured projects fetch

---

## Phase 3: User Story 1+2 - View & Navigate Featured Projects (Priority: P1) 🎯 MVP

**Goal**: Display dynamic featured projects on homepage with navigation to portfolio

**Independent Test**: Visit homepage → see featured projects grid → click "View All" → navigate to portfolio → click project card → navigate to project details

### Implementation for User Story 1+2

- [x] T002 [P] [US1] Add translation keys to `frontend/messages/ru.json` (home.featuredTitle, home.viewAll)
- [x] T003 [P] [US1] Add translation keys to `frontend/messages/en.json` (home.featuredTitle, home.viewAll)
- [x] T004 [US1] Create `frontend/components/home/` directory structure
- [x] T005 [US1] Create `FeaturedProjects` component in `frontend/components/home/FeaturedProjects.tsx`
- [x] T006 [US1] Implement loading skeleton state in `FeaturedProjects.tsx`
- [x] T007 [US1] Implement empty state handling (hide section when no featured projects) in `FeaturedProjects.tsx`
- [x] T008 [US2] Add "View All Projects" navigation link in `FeaturedProjects.tsx`
- [x] T009 [US1] Update homepage to import and use `FeaturedProjects` component in `frontend/app/[locale]/page.tsx`
- [x] T010 [US1] Remove static `featuredProjects` data and related code from `frontend/app/[locale]/page.tsx`

**Checkpoint**: Homepage displays dynamic featured projects with working navigation

---

## Phase 4: User Story 3 - Admin Featured Toggle (Priority: P2)

**Goal**: Verify admin can toggle featured status on projects

**Independent Test**: Login to Django Admin → edit Project → toggle "Featured" checkbox → save → verify homepage updates

> ✅ **ALREADY EXISTS**: `is_featured` field is already in Django Admin (verified in `backend/portfolio/admin.py`)

### Verification for User Story 3

- [x] T011 [US3] Verify `is_featured` checkbox visible in Django Admin project edit form
- [x] T012 [US3] Test marking project as featured → appears on homepage
- [x] T013 [US3] Test unmarking project as featured → disappears from homepage

**Checkpoint**: Admin can control which projects appear in featured section

---

## Phase 5: Polish & Validation

**Purpose**: Final verification and optional enhancements

- [x] T014 Verify mobile responsiveness (320px+ screens) on homepage featured section
- [x] T015 Verify bilingual support (switch RU ↔ EN, content updates correctly)
- [x] T016 Verify lazy loading works (check Network tab for deferred image loads)
- [x] T017 Verify CLS < 0.1 (no layout shifts during image loading)
- [x] T018 [P] (Optional) Update API ordering for featured projects in `backend/portfolio/views.py` to use `-updated_date`
- [x] T019 Run full verification checklist from `quickstart.md`

**Checkpoint**: Feature complete and verified against all acceptance criteria

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────► SKIP (existing infrastructure)
                              │
Phase 2: Foundational ────────┘
         (T001)               │
                              ▼
Phase 3: US1+US2 ◄────────────┘
         (T002-T010)          │
                              ▼
Phase 4: US3 ◄────────────────┘ (can run in parallel with Phase 3)
         (T011-T013)          │
                              ▼
Phase 5: Polish ◄─────────────┘
         (T014-T019)
```

### User Story Dependencies

| Story | Depends On | Notes |
|-------|------------|-------|
| US1 (View) | T001 (API) | Core display functionality |
| US2 (Navigate) | T005 (Component) | Navigation built into FeaturedProjects |
| US3 (Admin) | None | Already implemented, just verification |

### Parallel Opportunities

**Phase 2-3 Parallel Tasks:**
```
T002 ──┬── (translations ru.json)
T003 ──┘   (translations en.json)
       │
       └──► T004 → T005 → T006 → T007 → T008 → T009 → T010
```

**Phase 4 can run in parallel with Phase 3** (different scope - admin vs frontend)

---

## Parallel Example: Translations + Component

```bash
# Can run simultaneously (different files):
T002: Add translation keys to frontend/messages/ru.json
T003: Add translation keys to frontend/messages/en.json

# Then sequentially:
T004: Create frontend/components/home/ directory
T005: Create FeaturedProjects component
```

---

## Implementation Strategy

### MVP First (Recommended)

1. ✅ Phase 1: Skip (infrastructure exists)
2. Complete T001: API client update
3. Complete T002-T010: Full US1+US2 implementation
4. **STOP and VALIDATE**: Test featured projects display and navigation
5. Demo/deploy if ready

### Total Estimated Time

| Phase | Tasks | Time |
|-------|-------|------|
| Setup | 0 | 0 min |
| Foundational | 1 | 5 min |
| US1+US2 | 9 | 40 min |
| US3 | 3 | 10 min (verification only) |
| Polish | 6 | 20 min |
| **Total** | **19** | **~75 min** |

---

## Verification Checklist (from quickstart.md)

After implementation, verify:

- [x] Featured projects display on homepage
- [x] Up to 6 projects shown (FR-003)
- [x] Section hidden when no featured projects (FR-004)
- [x] Cards link to project details (FR-006)
- [x] "View All Projects" links to /portfolio (FR-005)
- [x] Images lazy load (FR-009)
- [x] Works in Russian and English (FR-012)
- [x] Mobile responsive (SC-004)
- [x] No CLS issues (SC-008)

---

## Notes

- T001 is foundational - blocks all other tasks
- T002+T003 can run in parallel (different translation files)
- US3 verification can happen anytime after Admin access
- T018 is optional enhancement for strict FR-011 compliance
- Commit after each logical group (T001, T002-T003, T004-T010, etc.)
