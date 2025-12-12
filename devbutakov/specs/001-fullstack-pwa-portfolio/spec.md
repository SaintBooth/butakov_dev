# Feature Specification: Fullstack PWA Portfolio

**Feature Branch**: `001-fullstack-pwa-portfolio`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Build a production-ready Fullstack PWA portfolio using Next.js (App Router) for the frontend and Django Rest Framework for the backend. The application serves as a professional showcase for a developer and digital marketer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Portfolio Projects (Priority: P1)

A visitor wants to browse portfolio projects to understand the developer's skills and experience. They can filter projects by category (Web Dev, Marketing, Pet Projects) and view project details including descriptions, technologies used, and links to live demos or GitHub repositories.

**Why this priority**: This is the core value proposition of the portfolio site. Without the ability to showcase work, the site fails its primary purpose of demonstrating skills to potential employers and clients.

**Independent Test**: Can be fully tested by navigating to the portfolio page, viewing project cards in Bento Grid layout, filtering by categories, and clicking through to project details. Delivers immediate value by showcasing developer's work.

**Acceptance Scenarios**:

1. **Given** a visitor is on the homepage, **When** they click on "Portfolio" in navigation, **Then** they see a Bento Grid layout with project cards displayed
2. **Given** a visitor is on the portfolio page, **When** they click on a filter tab (Web Dev/Marketing/Pet Projects), **Then** only projects matching that category are displayed
3. **Given** a visitor views a project card, **When** they click on it, **Then** they see detailed project information including description, technologies, and links to demo/GitHub
4. **Given** a visitor is viewing portfolio on mobile, **When** they scroll through projects, **Then** cards stack in a single column maintaining rounded corners and spacing

---

### User Story 2 - Submit Contact Form (Priority: P1)

A potential client or employer wants to contact the developer. They fill out a contact form with their name, email, phone, and message. The form includes a consent checkbox for 152-ФЗ compliance, and upon submission, the lead is saved to the database and a notification is sent via Telegram Bot.

**Why this priority**: Contact forms are essential for lead generation and business inquiries. This is a critical conversion point for both landing page (clients) and portfolio (employers) purposes.

**Independent Test**: Can be fully tested by filling out the contact form, checking/unchecking consent checkbox, submitting, and verifying data appears in database and Telegram notification is received. Delivers value by enabling business communication.

**Acceptance Scenarios**:

1. **Given** a visitor is on the contacts page, **When** they fill out the contact form with valid data and check consent checkbox, **Then** they can submit the form
2. **Given** a visitor fills out the contact form, **When** they uncheck the consent checkbox, **Then** the submit button becomes disabled
3. **Given** a visitor submits a valid contact form, **When** submission is successful, **Then** the lead data is saved to PostgreSQL and a Telegram notification is sent immediately
4. **Given** a visitor submits the contact form, **When** there is a validation error, **Then** appropriate error messages are displayed

---

### User Story 3 - View GitHub Activity (Priority: P2)

A potential employer wants to verify the developer's active coding activity. They navigate to the "About Me" page where they see a dynamic GitHub contribution graph showing recent commits and activity, demonstrating ongoing development work.

**Why this priority**: GitHub activity graph provides proof of active development and coding skills, which is valuable for employers evaluating candidates. However, it's secondary to portfolio showcase.

**Independent Test**: Can be fully tested by navigating to About Me page and verifying GitHub contribution graph displays correctly with data fetched from GitHub API. Delivers value by demonstrating active coding practice.

**Acceptance Scenarios**:

1. **Given** a visitor is on the About Me page, **When** the page loads, **Then** they see a GitHub contribution graph displaying recent activity
2. **Given** the GitHub API is unavailable, **When** the page attempts to load activity data, **Then** a graceful fallback message is displayed without breaking the page
3. **Given** a visitor views the GitHub activity graph, **When** they hover over contribution squares, **Then** they see commit count and date information

---

### User Story 4 - Switch Language (Priority: P2)

A visitor wants to view the site in their preferred language (Russian or English). The site automatically detects their browser language and redirects them to the appropriate language version. They can manually switch languages using a language switcher without full page reload.

**Why this priority**: Multilingual support is essential for reaching both Russian and international audiences. However, the site can function with a single language initially, making this P2.

**Independent Test**: Can be fully tested by visiting the site root, verifying automatic language detection and redirect, then manually switching languages and verifying content updates. Delivers value by making the site accessible to broader audience.

**Acceptance Scenarios**:

1. **Given** a visitor with Russian browser language visits the site root, **When** the page loads, **Then** they are redirected to `/ru/` version
2. **Given** a visitor with English browser language visits the site root, **When** the page loads, **Then** they are redirected to `/en/` version
3. **Given** a visitor is on `/ru/portfolio`, **When** they click the language switcher to English, **Then** they are taken to `/en/portfolio` without full page reload
4. **Given** a visitor switches languages, **When** they navigate to other pages, **Then** their language preference is maintained

---

### User Story 5 - Manage Cookie Preferences (Priority: P2)

A visitor wants to control their privacy by managing cookie preferences. On first visit, they see a cookie consent banner. They can accept all cookies, customize preferences, or revoke consent later via footer link.

**Why this priority**: Cookie consent is legally required (152-ФЗ, GDPR) and demonstrates professional compliance. However, the site can function with basic necessary cookies initially.

**Independent Test**: Can be fully tested by visiting the site for the first time, interacting with cookie banner, customizing preferences, and verifying analytics scripts only load after consent. Delivers value by ensuring legal compliance and user privacy control.

**Acceptance Scenarios**:

1. **Given** a visitor visits the site for the first time, **When** the page loads, **Then** a cookie consent banner appears at the bottom center
2. **Given** a visitor sees the cookie consent banner, **When** they click "Accept All", **Then** analytics scripts (Yandex Metrika, Google Analytics) are loaded
3. **Given** a visitor clicks "Settings" on cookie banner, **When** the settings modal opens, **Then** they can toggle analytics cookies while necessary cookies remain enabled
4. **Given** a visitor has accepted cookies, **When** they click "Cookie Settings" in footer, **Then** the settings modal opens allowing them to revoke consent

---

### User Story 6 - Install as PWA (Priority: P3)

A visitor wants to install the portfolio site as a Progressive Web App on their mobile device or desktop. They can install it via a custom install button or browser prompt, and the app works offline with cached content.

**Why this priority**: PWA installation enhances user experience and demonstrates modern development skills, but is not essential for core portfolio functionality.

**Independent Test**: Can be fully tested by clicking install button, verifying app installs in standalone mode, going offline, and verifying cached content is accessible. Delivers value by providing app-like experience.

**Acceptance Scenarios**:

1. **Given** a visitor is on a supported device, **When** they click "Install App" button, **Then** the app installs and appears on home screen
2. **Given** a visitor has installed the PWA, **When** they open it, **Then** it runs in standalone mode without browser UI
3. **Given** a visitor is using the installed PWA, **When** they go offline, **Then** they can still view cached homepage and contact information
4. **Given** a visitor on iOS sees install instructions, **When** they follow the manual steps, **Then** they can add the site to home screen

---

### Edge Cases

- What happens when GitHub API is rate-limited or unavailable? (Graceful fallback with cached data or message)
- How does system handle form submission when database is temporarily unavailable? (Queue submission, retry mechanism, user notification)
- What happens when Telegram Bot API fails to send notification? (Log error, continue with database save, admin notification)
- How does system handle language switching when API returns data in wrong language? (Ensure API respects lang parameter)
- What happens when user disables JavaScript? (Progressive enhancement - basic functionality works, enhanced features degrade gracefully)
- How does system handle very long project descriptions or form messages? (Character limits, text truncation with "read more")
- What happens when cookie consent is revoked while user is browsing? (Analytics scripts disabled, page reload to clear state)

## Clarifications

### Session 2025-12-12

- Q: What should push notifications be used for? → A: Notify opted-in visitors about new portfolio projects or service updates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display portfolio projects in Bento Grid layout with filterable categories (Web Dev, Marketing, Pet Projects)
- **FR-002**: System MUST fetch portfolio project data from Django REST API endpoint
- **FR-003**: System MUST display project details including title, description, technologies, demo link, and GitHub link
- **FR-004**: System MUST provide contact form with fields: name, email, phone, message
- **FR-005**: System MUST include active consent checkbox in contact form with text: "Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности"
- **FR-006**: System MUST disable submit button when consent checkbox is unchecked
- **FR-007**: System MUST save contact form submissions to PostgreSQL database
- **FR-008**: System MUST send Telegram Bot notification immediately upon form submission
- **FR-009**: System MUST display GitHub contribution graph on About Me page using GitHub API
- **FR-010**: System MUST support Russian and English languages with URL prefixes `/ru/` and `/en/`
- **FR-011**: System MUST auto-detect browser language via Accept-Language header and redirect accordingly
- **FR-012**: System MUST provide language switcher UI component that changes language without full page reload
- **FR-013**: System MUST display cookie consent banner on first visit (bottom center, non-intrusive)
- **FR-014**: System MUST prevent analytics scripts (Yandex Metrika, Google Analytics) from loading until user accepts analytics cookies
- **FR-015**: System MUST provide cookie settings modal with granular control (necessary vs analytics cookies)
- **FR-016**: System MUST include "Cookie Settings" link in footer on all pages
- **FR-017**: System MUST support PWA installation with manifest.json and service worker
- **FR-018**: System MUST provide offline functionality with NetworkFirst caching strategy
- **FR-019**: System MUST support dark/light theme switching based on system preferences
- **FR-020**: System MUST use bottom navigation bar on mobile devices (not hamburger menu)
- **FR-021**: System MUST implement smooth page transitions using Framer Motion
- **FR-022**: System MUST use Shadcn/ui components built on Tailwind CSS
- **FR-023**: System MUST support user opt-in Web Push notifications with stored consent, VAPID-secured keys, ability to unsubscribe, and use them only to notify visitors about new portfolio projects or service updates (no lead/PII pushes)
- **FR-024**: System MUST use Django Admin for content management (projects, services)
- **FR-025**: System MUST expose REST API endpoints for frontend data fetching
- **FR-026**: System MUST support i18n in backend API (lang query parameter)
- **FR-027**: System MUST achieve PageSpeed score of 95-100
- **FR-028**: System MUST implement Schema.org JSON-LD markup (Person, Offer, CreativeWork schemas)
- **FR-029**: System MUST integrate Google Analytics (GA4) and Yandex Metrika with conditional loading, configured goals (form_submit, click_whatsapp, click_telegram, copy_email, scroll_depth_50), and Webvisor 2.0 enabled only after consent
- **FR-030**: System MUST provide privacy policy page accessible at `/privacy` (or `/ru/privacy` and `/en/privacy`)

### Key Entities *(include if feature involves data)*

- **Project**: Represents a portfolio project/work item
  - Attributes: title, description, category (Web Dev/Marketing/Pet Project), technologies (array), demo_url, github_url, featured_image, created_date, updated_date
  - Relationships: None (standalone entity)
  
- **Contact Lead**: Represents a form submission from a potential client/employer
  - Attributes: name, email, phone, message, consent_given (boolean), submitted_at, ip_address (optional for analytics)
  - Relationships: None (standalone entity)
  
- **Service**: Represents a service offering (e.g., "Сайт под ключ", "Разработка на React/Python")
  - Attributes: name, description, price (optional), category, featured (boolean)
  - Relationships: None (standalone entity)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view and filter portfolio projects within 2 seconds of page load (95th percentile)
- **SC-002**: Contact form submissions are saved to database and Telegram notifications sent within 5 seconds of submission
- **SC-003**: Site achieves PageSpeed Insights score of 95-100 on both mobile and desktop
- **SC-004**: GitHub contribution graph loads and displays within 3 seconds (with graceful fallback if API unavailable)
- **SC-005**: Language switching completes without full page reload in under 500ms
- **SC-006**: Cookie consent banner appears on first visit and analytics scripts do not load until user accepts
- **SC-007**: PWA installs successfully on Android, iOS, and desktop browsers (where supported)
- **SC-008**: Offline functionality allows users to view homepage and contact information when network is unavailable
- **SC-009**: Site supports both Russian and English languages with complete translations for all user-facing content
- **SC-010**: Dark/light theme switching completes without FOUC (Flash of Unstyled Content)
- **SC-011**: Mobile navigation (bottom bar) is accessible and functional on devices with screen width 320px and above
- **SC-012**: All forms comply with 152-ФЗ requirements (consent checkbox, privacy policy link)
- **SC-013**: Schema.org markup validates successfully with Google Rich Results Test
- **SC-014**: Site maintains visual consistency across all pages using Bento Grid layout and design system
- **SC-015**: Django Admin allows content managers to create, edit, and delete projects and services without technical knowledge
- **SC-016**: Web Push notifications can be opted into/out of, deliver within 5 seconds after trigger, and never send without prior consent

## Assumptions

- GitHub API access is available (Personal Access Token or OAuth)
- Telegram Bot API token is available for notifications
- PostgreSQL database is provisioned and accessible
- Production server has Docker and Docker Compose installed
- Domain name is configured and SSL certificate is available
- Content (project descriptions, service information) will be provided in both Russian and English
- Initial portfolio projects and services will be seeded via Django Admin
- Analytics accounts (Google Analytics GA4, Yandex Metrika) are already set up
- Server has sufficient resources for Next.js production build and Django application

## Dependencies

- Next.js App Router (latest stable)
- Django 4.2+ with Django REST Framework
- PostgreSQL database
- Docker and Docker Compose
- GitHub API (for contribution graph)
- Telegram Bot API (for notifications)
- Nginx (for reverse proxy in production)

## Notes

- This is a greenfield project - no existing codebase to integrate with
- Focus on production-ready implementation following all constitution principles
- All design decisions must align with "Engineering Aesthetic" philosophy
- Performance is critical - PageSpeed 95-100 is non-negotiable
- Legal compliance (152-ФЗ) is mandatory for production deployment
- CI/CD pipeline should be set up from the start for automated deployments
