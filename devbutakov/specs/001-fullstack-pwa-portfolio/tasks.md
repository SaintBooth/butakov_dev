---
description: "Task list for Fullstack PWA Portfolio feature implementation"
---

# Tasks: Fullstack PWA Portfolio

**Input**: Design documents from `/specs/001-fullstack-pwa-portfolio/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. Not included in initial scope per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow plan.md structure: `backend/` and `frontend/` directories

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create monorepo structure with `backend/` and `frontend/` directories at repository root
- [x] T002 [P] Initialize Django project in `backend/` with Django 4.2+ and DRF dependencies
- [x] T003 [P] Initialize Next.js project in `frontend/` with App Router and TypeScript
- [x] T004 [P] Create `docker-compose.yml` with services: db (PostgreSQL), backend (Django), frontend (Next.js)
- [x] T005 [P] Configure environment variables management with `.env.example` files
- [x] T006 [P] Set up `.gitignore` for Python, Node.js, and Docker artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Setup PostgreSQL database connection in `backend/config/settings/base.py`
- [x] T008 [P] Configure CORS in `backend/config/settings/base.py` for frontend communication (localhost:3000)
- [x] T009 [P] Configure Django Admin in `backend/config/settings/base.py`
- [x] T010 Create Project model in `backend/portfolio/models.py` with fields: title, title_ru, title_en, description, description_ru, description_en, category, tags, featured_image, demo_url, github_url, is_featured, order, created_date, updated_date
- [x] T011 [P] Create ContactSubmission model in `backend/portfolio/models.py` with fields: name, email, phone, message, consent_given, submitted_at, ip_address, status
- [x] T012 [P] Create Service model in `backend/portfolio/models.py` with fields: name, name_ru, name_en, description, description_ru, description_en, price, category, is_featured, order, created_date, updated_date
- [x] T013 Run Django migrations: `python manage.py makemigrations` and `python manage.py migrate`
- [x] T014 Create DRF serializers in `backend/portfolio/serializers.py`: ProjectSerializer, ContactSubmissionSerializer, ServiceSerializer
- [x] T015 [P] Create API views in `backend/portfolio/views.py`: ProjectListView (GET /api/projects/), ContactSubmissionCreateView (POST /api/contact/)
- [x] T016 [P] Configure API URLs in `backend/portfolio/urls.py` and include in `backend/config/urls.py`
- [x] T017 [P] Register models in `backend/portfolio/admin.py` for Django Admin interface
- [x] T018 Create Telegram notification service in `backend/portfolio/services.py` with function to send notifications via Telegram Bot API
- [x] T019 Integrate Telegram notification trigger on ContactSubmission creation using Django signal in `backend/portfolio/signals.py`
- [x] T020 Configure API pagination and filtering (by category, lang parameter) in `backend/portfolio/views.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Portfolio Projects (Priority: P1) 🎯 MVP

**Goal**: Display portfolio projects in Bento Grid layout with filterable categories (Web Dev, Marketing, Pet Projects)

**Independent Test**: Navigate to portfolio page, view project cards in Bento Grid layout, filter by categories, click through to project details. Verify projects load from Django API.

### Implementation for User Story 1

- [x] T021 [US1] Install and configure Tailwind CSS in `frontend/tailwind.config.ts`
- [x] T022 [US1] Install Shadcn/ui base components (button, card) in `frontend/components/ui/`
- [x] T023 [US1] Configure Shadcn/ui theme with semantic CSS variables in `frontend/styles/globals.css`
- [x] T024 [US1] Create ProjectCard component in `frontend/components/portfolio/ProjectCard.tsx` with props: title, description, category, tags, featured_image, demo_url, github_url
- [x] T025 [US1] Create BentoGrid component in `frontend/components/portfolio/BentoGrid.tsx` with responsive stacking for mobile
- [x] T026 [US1] Create Portfolio page in `frontend/app/[locale]/portfolio/page.tsx` that fetches projects from `/api/projects/`
- [x] T027 [US1] Implement category filtering (Web Dev, Marketing, Pet Projects) in `frontend/app/[locale]/portfolio/page.tsx` with filter tabs
- [x] T028 [US1] Add loading state (Suspense) and error handling in `frontend/app/[locale]/portfolio/page.tsx`
- [x] T029 [US1] Create project detail modal/page in `frontend/app/[locale]/portfolio/[id]/page.tsx` or modal component
- [x] T030 [US1] Connect frontend to Django API endpoint `GET /api/projects/?lang={locale}&category={category}`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Submit Contact Form (Priority: P1) 🎯 MVP

**Goal**: Contact form with 152-ФЗ consent checkbox that saves to database and sends Telegram notification

**Independent Test**: Fill out contact form, check/uncheck consent checkbox, submit, verify data appears in database and Telegram notification is received.

### Implementation for User Story 2

- [x] T031 [US2] Install Zod for form validation in `frontend/package.json`
- [x] T032 [US2] Create ContactForm component in `frontend/components/forms/ContactForm.tsx` with fields: name, email, phone, message
- [x] T033 [US2] Add 152-ФЗ consent checkbox in `frontend/components/forms/ContactForm.tsx` with text: "Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности"
- [x] T034 [US2] Implement Zod validation schema in `frontend/components/forms/ContactForm.tsx` for all form fields
- [x] T035 [US2] Disable submit button when consent checkbox is unchecked in `frontend/components/forms/ContactForm.tsx`
- [x] T036 [US2] Create Contact page in `frontend/app/[locale]/contact/page.tsx` that renders ContactForm component
- [x] T037 [US2] Implement form submission handler in `frontend/components/forms/ContactForm.tsx` that POSTs to `/api/contact/`
- [x] T038 [US2] Add form submission states (loading, success, error) in `frontend/components/forms/ContactForm.tsx`
- [x] T039 [US2] Display success/error messages after form submission in `frontend/components/forms/ContactForm.tsx`
- [x] T040 [US2] Verify backend endpoint `POST /api/contact/` validates consent_given=true and saves to database
- [x] T041 [US2] Verify Telegram notification is sent when ContactSubmission is created

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View GitHub Activity (Priority: P2)

**Goal**: Display GitHub contribution graph on About Me page using GitHub API

**Independent Test**: Navigate to About Me page, verify GitHub contribution graph displays correctly with data fetched from GitHub API. Test graceful fallback if API unavailable.

### Implementation for User Story 3

- [x] T042 [US3] Create GitHub API service in `frontend/lib/github.ts` to fetch contribution data using Personal Access Token
- [x] T043 [US3] Create GitHubActivity component in `frontend/components/about/GitHubActivity.tsx` to display contribution graph
- [x] T044 [US3] Create About Me page in `frontend/app/[locale]/about/page.tsx` that renders GitHubActivity component
- [x] T045 [US3] Implement graceful fallback UI in `frontend/components/about/GitHubActivity.tsx` when GitHub API is unavailable or rate-limited
- [x] T046 [US3] Add loading state for GitHub activity fetch in `frontend/components/about/GitHubActivity.tsx`
- [x] T047 [US3] Implement caching for GitHub API responses to avoid rate limiting (use Next.js caching or localStorage)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Switch Language (Priority: P2)

**Goal**: Support Russian and English languages with URL prefixes `/ru/` and `/en/`, auto-detect browser language, provide language switcher

**Independent Test**: Visit site root, verify automatic language detection and redirect. Manually switch languages, verify content updates without full page reload.

### Implementation for User Story 4

- [x] T048 [US4] Install next-intl in `frontend/package.json`
- [x] T049 [US4] Create translation files `frontend/messages/ru.json` and `frontend/messages/en.json` with initial translations
- [x] T050 [US4] Configure next-intl middleware in `frontend/middleware.ts` for language detection from Accept-Language header
- [x] T051 [US4] Set up routing with `[locale]` dynamic segment in `frontend/app/[locale]/layout.tsx`
- [x] T052 [US4] Create root layout in `frontend/app/[locale]/layout.tsx` with NextIntlClientProvider
- [x] T053 [US4] Create language switcher component in `frontend/components/layout/LanguageSwitcher.tsx` that changes language without full page reload
- [x] T054 [US4] Add language switcher to navigation/header in `frontend/components/layout/Header.tsx` or `frontend/components/layout/Navigation.tsx`
- [x] T055 [US4] Update all pages to use translations from `useTranslations()` hook instead of hardcoded text
- [x] T056 [US4] Ensure API endpoints respect `lang` query parameter and return appropriate language fields (title_ru/title_en, description_ru/description_en)
- [x] T057 [US4] Update Portfolio page to pass `lang={locale}` parameter to API calls
- [x] T058 [US4] Test language persistence across page navigation

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Manage Cookie Preferences (Priority: P2)

**Goal**: Cookie consent banner on first visit, granular cookie preferences, conditional analytics script loading

**Independent Test**: Visit site for first time, interact with cookie banner, customize preferences, verify analytics scripts only load after consent.

### Implementation for User Story 5

- [x] T059 [US5] Install vanilla-cookieconsent in `frontend/package.json`
- [x] T060 [US5] Create CookieConsent component in `frontend/components/layout/CookieConsent.tsx` that initializes vanilla-cookieconsent
- [x] T061 [US5] Configure cookie consent modal in `frontend/components/layout/CookieConsent.tsx` with categories: necessary, analytics
- [x] T062 [US5] Configure cookie settings modal in `frontend/components/layout/CookieConsent.tsx` for granular control
- [x] T063 [US5] Add CookieConsent component to root layout in `frontend/app/[locale]/layout.tsx`
- [x] T064 [US5] Implement conditional loading of Yandex Metrika script in `frontend/app/[locale]/layout.tsx` (only after analytics consent)
- [x] T065 [US5] Implement conditional loading of Google Analytics (GA4) script in `frontend/app/[locale]/layout.tsx` (only after analytics consent)
- [x] T066 [US5] Add "Cookie Settings" link to footer in `frontend/components/layout/Footer.tsx` that opens settings modal
- [x] T067 [US5] Add translations for cookie consent text in `frontend/messages/ru.json` and `frontend/messages/en.json`
- [x] T068 [US5] Test cookie consent banner appears on first visit and analytics scripts do not load until consent given

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - Install as PWA (Priority: P3)

**Goal**: PWA installation support with manifest.json, service worker, and offline functionality

**Independent Test**: Click install button, verify app installs in standalone mode, go offline, verify cached content is accessible.

### Implementation for User Story 6

- [x] T069 [US6] Install @serwist/next in `frontend/package.json`
- [x] T070 [US6] Configure @serwist/next in `frontend/next.config.js` with NetworkFirst caching strategy
- [x] T071 [US6] Create `frontend/public/manifest.json` with required fields: name, short_name, description, start_url, display: "standalone", theme_color, background_color
- [x] T072 [US6] Add maskable icons for Android in `frontend/public/icons/` (192x192, 512x512)
- [x] T073 [US6] Configure theme colors in `frontend/public/manifest.json` matching design system colors
- [x] T074 [US6] Create custom install prompt component in `frontend/components/layout/InstallPrompt.tsx` for "Install App" button
- [x] T075 [US6] Add InstallPrompt component to appropriate page (homepage or navigation)
- [x] T076 [US6] Create offline fallback page in `frontend/public/offline.html` or `frontend/app/offline/page.tsx`
- [ ] T077 [US6] Test PWA installation on Android, iOS (with manual instructions), and desktop browsers
- [ ] T078 [US6] Test offline functionality - verify homepage and contact information are accessible when network is unavailable

### Push Notifications (Constitutional - ties to PWA)

- [ ] T106 [US6] Implement Web Push backend service in `backend/portfolio/services.py` using pywebpush/django-webpush with generated VAPID keys stored securely
- [ ] T107 [US6] Add push subscription model and API endpoints (`POST /api/push/subscribe`, `DELETE /api/push/subscribe`) that store consent state and enforce opt-in/out
- [ ] T108 [US6] Implement frontend subscription flow (prompt UI, consent gating tied to analytics/cookie preferences) in `frontend/app/[locale]/layout.tsx` or a shared provider
- [ ] T109 [US6] Handle service worker push events with notification UI and add a test trigger to verify delivery (no pushes without consent)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Additional Features & Polish

**Purpose**: Cross-cutting concerns and additional features from spec.md

- [x] T079 [P] Configure next-themes in `frontend/app/[locale]/layout.tsx` with ThemeProvider for dark/light mode switching
- [x] T080 [P] Implement FOUC prevention for theme switching in `frontend/app/[locale]/layout.tsx`
- [x] T081 [P] Create bottom navigation bar component in `frontend/components/layout/BottomNav.tsx` for mobile devices (not hamburger menu)
- [x] T082 [P] Implement smooth page transitions using Framer Motion in `frontend/app/[locale]/layout.tsx`
- [x] T083 [P] Create Homepage in `frontend/app/[locale]/page.tsx` with hero section and navigation to portfolio/services/contact
- [x] T084 [P] Create Services page in `frontend/app/[locale]/services/page.tsx` that fetches from `/api/services/`
- [x] T085 [P] Create Privacy Policy page in `frontend/app/[locale]/privacy/page.tsx` with 152-ФЗ compliant content
- [x] T086 [P] Add JSON-LD Schema markup (Person schema) in `frontend/app/[locale]/layout.tsx`
- [x] T087 [P] Add JSON-LD Schema markup (Offer schema for services) in `frontend/app/[locale]/services/page.tsx`
- [x] T088 [P] Add JSON-LD Schema markup (CreativeWork schema for projects) in `frontend/app/[locale]/portfolio/page.tsx`
- [ ] T089 [P] Validate Schema.org markup with Google Rich Results Test
- [ ] T090 [P] Optimize images using Next.js Image component throughout all pages
- [ ] T091 [P] Configure next/font for font optimization in `frontend/app/[locale]/layout.tsx`
- [ ] T092 [P] Run PageSpeed Insights and optimize to achieve 95-100 score
- [ ] T093 [P] Test responsive design on mobile devices (320px and above)
- [ ] T094 [P] Test accessibility (WCAG 2.1 AA minimum) with screen readers and keyboard navigation
- [ ] T110 [P] Configure GA4 goals/events for `form_submit`, `click_whatsapp`, `click_telegram`, `copy_email`, `scroll_depth_50`; ensure they only fire after analytics consent
- [ ] T111 [P] Configure Yandex Metrika goals for the same events and enable Webvisor 2.0 with privacy-safe settings; load only after analytics consent
- [ ] T112 [P] Validate analytics events in both RU/EN flows and confirm no data is sent before consent

---

## Phase 10: Production Deployment

**Purpose**: CI/CD pipeline and production configuration

- [ ] T095 [P] Create Nginx configuration in `nginx/nginx.conf` for reverse proxy
- [x] T096 [P] Create production Docker Compose override in `docker-compose.prod.yml`
- [x] T097 [P] Configure multi-stage Dockerfiles for `backend/Dockerfile` and `frontend/Dockerfile`
- [x] T098 [P] Create GitHub Actions workflow in `.github/workflows/deploy.yml` for CI/CD
- [ ] T099 [P] Configure GitHub Secrets (HOST, USERNAME, SSH_KEY) for deployment
- [ ] T100 [P] Add database migration step to CI/CD workflow
- [ ] T101 [P] Add static files collection step to CI/CD workflow (Django collectstatic)
- [ ] T102 [P] Test deployment workflow end-to-end
- [ ] T103 [P] Configure production environment variables on server
- [ ] T104 [P] Set up SSL certificate (Let's Encrypt) and configure HTTPS
- [ ] T105 [P] Test production deployment and verify all features work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Additional Features (Phase 9)**: Can proceed in parallel with user stories once foundational is complete
- **Production Deployment (Phase 10)**: Depends on all desired user stories and features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Should be implemented early as it affects all pages
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Models before API endpoints
- API endpoints before frontend components
- Components before pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within foundational phase marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Additional Features (Phase 9) tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Portfolio Projects)
4. Complete Phase 4: User Story 2 (Contact Form)
5. **STOP and VALIDATE**: Test User Stories 1 and 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Add Additional Features → Test → Deploy/Demo
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Portfolio)
   - Developer B: User Story 2 (Contact Form)
   - Developer C: User Story 4 (Language Switching) - affects all pages, should be done early
3. Then:
   - Developer A: User Story 3 (GitHub Activity)
   - Developer B: User Story 5 (Cookie Consent)
   - Developer C: User Story 6 (PWA)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- User Story 4 (Language Switching) should be implemented early as it affects all pages
- All pages must use translations from `useTranslations()` hook, not hardcoded text
- Performance optimization (PageSpeed 95-100) is critical and should be monitored throughout development
- Legal compliance (152-ФЗ) is mandatory - ensure consent checkbox and privacy policy are properly implemented

