<!--
Sync Impact Report:
Version: 1.5.0 (added CI/CD Automation requirements)
Created: 2025-01-27
Last Amended: 2025-01-27

Principles Added:
- I. Headless Architecture (Next.js + Django DRF)
- II. Mobile-First Design
- III. Performance-First (PageSpeed 95-100)
- IV. Dual Purpose (Landing + Portfolio)
- V. Modern Stack (no Django templates)
- VI. Integration-First (GitHub API, Telegram Bot)
- VII. SEO & Analytics (Schema.org JSON-LD for AI agents, Google Analytics, Yandex Metrika)

Principle Updates:
- v1.1.0: VII. Expanded to include Google Analytics and detailed Schema.org requirements for AI Knowledge Graph
- v1.2.0: Added VIII. Internationalization (i18n), IX. Dark/Light Mode Support, X. Legal Compliance (152-ФЗ)
- v1.3.0: Expanded X. Legal Compliance to include Cookie Consent with Privacy First approach
- v1.4.0: Added XI. App-Like Experience (PWA & Native Feel), XII. Engineering Aesthetic Design System
- v1.4.1: Expanded Design System Requirements with Color Palette & Theme System (semantic CSS variables, brand colors)
- v1.5.0: Added XIII. CI/CD Automation (Zero-Touch Deployment)

Sections Added:
- Technical Stack Requirements
- Performance Standards
- SEO & Analytics Requirements (expanded in v1.1.0 with Schema.org JSON-LD details, Google Analytics, semantic HTML)
- Integration Requirements

Section Updates:
- v1.1.0: SEO & Analytics Requirements: Added comprehensive Schema.org JSON-LD implementation guide, Google Analytics integration, semantic HTML requirements, validation requirements
- v1.2.0: 
  - Technical Stack Requirements: Added Tailwind CSS (mandatory), next-themes, next-intl, django-modeltranslation
  - Added Dark/Light Mode Implementation Requirements section
  - Added Internationalization (i18n) Implementation Requirements section
  - Added Legal Compliance Requirements (152-ФЗ) section
  - Added Cookie Consent Implementation Requirements (Privacy First) section
  - Added Design System Requirements section (Bento Grid, Typography, Color Palette & Theme System, Animations, Shadcn/ui)
  - Added UX Requirements section (Bottom Navigation, Gestures, Page Transitions)
  - Added PWA (Progressive Web App) Requirements section (Manifest, Service Worker, Offline, Install)
  - Added Push Notifications Requirements section
  - Added CI/CD & Deployment Requirements section (Docker Compose, GitHub Actions, deployment workflow)
  - Page Structure Requirements: Added Privacy Policy page and Footer component as mandatory
  - Technical Stack Requirements: Added Shadcn/ui, Framer Motion, @serwist/next, django-webpush/pywebpush, Docker, GitHub Actions

Templates Status:
- ✅ plan-template.md: Compatible (web app structure)
- ✅ spec-template.md: Compatible
- ✅ tasks-template.md: Compatible
- ⚠️ No updates required - templates are generic enough

Follow-up TODOs: None
-->

# DevButakov Portfolio Site Constitution

## Core Principles

### I. Headless Architecture (NON-NEGOTIABLE)

The application MUST use a separated frontend-backend architecture:
- **Frontend**: Next.js (responsible for SEO, PageSpeed optimization, UI/UX)
- **Backend**: Django DRF (Django REST Framework) (responsible for database, business logic, administration)
- **Communication**: REST API only
- **Rationale**: This architecture enables modern performance optimization techniques, separates concerns, and demonstrates full-stack development capabilities. Pure Django templates (Jinja2) are prohibited as they cannot achieve PageSpeed scores of 90-100 in 2026.

### II. Mobile-First Design

All UI components and layouts MUST be designed mobile-first:
- Responsive design is mandatory for all pages
- Mobile experience takes priority over desktop
- Breakpoints must be defined and tested at mobile sizes first
- **Rationale**: Ensures optimal user experience across all devices and aligns with modern web development practices.

### III. Performance-First (PageSpeed 95-100)

The application MUST achieve PageSpeed Insights scores of 95-100:
- All images MUST use Next.js `next/image` component for automatic WebP/AVIF conversion
- Lazy loading MUST be implemented for all content below the fold
- Fonts MUST use `next/font` to prevent layout shift (CLS)
- Core Web Vitals MUST be optimized (LCP, FID, CLS)
- **Rationale**: High PageSpeed scores are critical for SEO, user experience, and demonstrating modern development skills. This is a hard requirement for 2026 web standards.

### IV. Dual Purpose Architecture

The site MUST serve two distinct purposes simultaneously:
1. **Landing Page**: Sell services directly (target: WP/context advertising clients)
2. **Portfolio**: Demonstrate code quality and skills (target: future employers)
- Each page section MUST be designed with both audiences in mind
- Portfolio projects MUST include links to GitHub (code) and Deploy (live demo)
- Commercial projects MUST show business results (ROI, conversion metrics)
- **Rationale**: Maximizes value by serving both immediate business needs and long-term career goals.

### V. Modern Stack Prohibition

The following technologies are PROHIBITED:
- Django templates (Jinja2) for frontend rendering
- Server-side rendering with Django templates
- Any "old-school" templating approach that prevents PageSpeed optimization
- **Rationale**: These approaches cannot achieve the required performance standards and do not demonstrate modern full-stack capabilities.

### VI. Integration-First Approach

The application MUST integrate with external services to demonstrate technical capabilities:
- **GitHub API**: MUST display contribution graph, repository stars, and recent commits dynamically
- **Telegram Bot**: MUST send form submissions instantly via Telegram API
- **Rationale**: Live integrations show active development, real-time data, and practical API integration skills valued by employers and clients.

### VII. SEO & Analytics Mandatory (AI-Agent Optimized)

The application MUST implement comprehensive SEO and analytics optimized for both search engines and AI agents (ChatGPT, Perplexity, Gemini):
- **Schema.org JSON-LD**: MUST include Person (with `sameAs` array), Offer, CreativeWork/SoftwareSourceCode, and BreadcrumbList types
- **AI Knowledge Graph**: Schema.org markup MUST enable AI agents to build Knowledge Graph and understand person identity, services, and portfolio projects
- **Semantic HTML**: MUST use semantic HTML elements (`<main>`, `<article>`, proper heading hierarchy) in addition to JSON-LD
- **Google Analytics (GA4)**: MUST be integrated with Core Web Vitals reporting
- **Yandex Metrika**: MUST be integrated with Webvisor 2.0 enabled
- **Goals Tracking**: MUST track form_submit, click_whatsapp, click_telegram, copy_email, scroll_depth_50 across both analytics platforms
- **Validation**: Schema.org markup MUST pass Google Rich Results Test and Schema.org Validator before deployment
- **Rationale**: In 2026, AI agents don't just read text—they build Knowledge Graphs. Proper structured data enables AI to understand "This is Ivan, he's a programmer, these are his services, they cost X." SEO optimization and analytics are essential for both landing page effectiveness and demonstrating professional development practices.

### VIII. Internationalization (i18n) Mandatory

The application MUST support multiple languages (Russian and English minimum):
- **Frontend i18n**: MUST use `next-intl` library for Next.js App Router
- **Backend i18n**: MUST use `django-modeltranslation` for database content translation
- **URL Structure**: MUST use language prefixes (`/ru/` and `/en/`) for SEO optimization
- **Auto-detection**: MUST detect browser language via `Accept-Language` header and redirect accordingly
- **Language Switcher**: MUST provide UI component to switch languages without full page reload
- **Rationale**: Multilingual support is essential for reaching both Russian and international clients/employers. Separate URLs for languages improve SEO rankings in both Google and Yandex.

### IX. Dark/Light Mode Support

The application MUST support dark and light themes:
- **Library**: MUST use `next-themes` for theme management
- **Styling**: MUST use Tailwind CSS with dark mode classes (`dark:` prefix)
- **FOUC Prevention**: MUST prevent Flash of Unstyled Content (FOUC) using proper theme initialization
- **Default**: MUST respect system preferences (`system` theme) by default
- **Implementation**: MUST use `attribute="class"` in ThemeProvider to add `dark` class to `<html>` tag
- **Rationale**: Theme support improves user experience and demonstrates modern UI/UX practices. FOUC prevention is critical for professional appearance.

### X. Legal Compliance (152-ФЗ & GDPR)

The application MUST comply with Russian Federal Law 152-ФЗ (Personal Data Protection) and GDPR requirements:
- **Consent Mechanism**: All forms collecting personal data MUST include active consent checkbox
- **Consent Text**: MUST include explicit text: "Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности"
- **Consent Behavior**: Checkbox MAY be pre-checked, but user MUST be able to uncheck it (submit button MUST be disabled if unchecked)
- **Privacy Policy**: MUST have accessible `/privacy` page or PDF linked from footer
- **Privacy Policy Content**: MUST include standard 152-ФЗ compliant privacy policy template with personal information filled in
- **Cookie Consent**: MUST implement Privacy First cookie consent banner (analytics scripts MUST NOT load until user accepts)
- **Cookie Categories**: MUST provide separate consent for necessary cookies (theme, language) and analytics cookies (Yandex Metrika, Google Analytics)
- **Cookie Settings**: MUST provide "Settings" button to customize cookie preferences and ability to revoke consent
- **Cookie Footer Link**: MUST include "Cookie Settings" link in footer for easy access to preferences
- **Rationale**: Legal compliance is mandatory for Russian developers and international best practices. Non-compliance can result in significant fines. Privacy First approach improves PageSpeed scores and demonstrates professional development practices.

### XI. App-Like Experience (PWA & Native Feel)

The application MUST provide an app-like experience blurring the line between website and native application:
- **PWA Support**: MUST be installable as Progressive Web App with offline capabilities
- **Native Navigation**: MUST use bottom navigation bar on mobile devices (not hamburger menu)
- **Gesture Support**: MUST support swipe gestures for galleries and bottom sheet modals
- **Push Notifications**: MUST support Web Push API for user engagement (with proper consent)
- **Rationale**: In 2026, the boundary between websites and applications is disappearing. App-like experience demonstrates modern development skills and improves user engagement. PWA capabilities allow installation on home screens and offline access.

### XII. Engineering Aesthetic Design System

The application MUST follow "Engineering Aesthetic" design philosophy:
- **Layout**: MUST use Bento Grid (rectangular blocks of varying sizes) for portfolio, stats, and services
- **Typography**: MUST use modern sans-serif fonts (Geist, Inter, or Manrope) with large headings and generous white space
- **Animations**: MUST use physics-based micro-animations (Framer Motion) for buttons, transitions, and interactions
- **UI Components**: MUST use Shadcn/ui component library (copy-paste code, not npm package) built on Tailwind CSS
- **Rationale**: Design should convey structure, cleanliness, and technological sophistication. Engineering aesthetic aligns with full-stack developer identity and demonstrates attention to detail valued by employers and clients.

### XIII. CI/CD Automation (Zero-Touch Deployment)

The application MUST implement automated CI/CD pipeline for professional deployment workflow:
- **Containerization**: MUST use Docker Compose for consistent local and production environments
- **CI/CD Pipeline**: MUST use GitHub Actions for automated deployment on push to main branch
- **Deployment Process**: MUST be fully automated (no manual FTP, no manual service restarts)
- **Environment Parity**: Local development environment MUST match production (Docker Compose everywhere)
- **Rationale**: CI/CD automation eliminates "works on my machine" problems, reduces deployment errors, and demonstrates professional DevOps practices valued by employers. Zero-touch deployment allows focusing on development instead of manual deployment tasks.

## Technical Stack Requirements

### Frontend Stack
- **Framework**: Next.js (latest stable version) with App Router
- **Language**: TypeScript (preferred) or JavaScript
- **Styling**: Tailwind CSS (mandatory) - required for dark mode support
- **UI Components**: Shadcn/ui (mandatory) - copy-paste component library built on Tailwind CSS
- **Animations**: Framer Motion (mandatory) - physics-based animations library
- **Theme Management**: `next-themes` library (mandatory) for dark/light mode
- **Internationalization**: `next-intl` library (mandatory) for i18n support
- **Cookie Consent**: `vanilla-cookieconsent` library (mandatory) for Privacy First cookie management
- **PWA**: `@serwist/next` library (mandatory) - modern PWA solution for Next.js
- **Image Optimization**: Next.js `next/image` component (mandatory)
- **Font Loading**: Next.js `next/font` (mandatory) - MUST use modern sans-serif fonts (Geist, Inter, or Manrope)
- **SEO**: Next.js built-in SEO features + custom Schema.org implementation

### Backend Stack
- **Framework**: Django with Django REST Framework (DRF)
- **Language**: Python 3.11+
- **Database**: PostgreSQL (preferred) or SQLite for development
- **API**: REST API only (no GraphQL)
- **Admin**: Django Admin for content management
- **Internationalization**: `django-modeltranslation` library (mandatory) for database content translation
- **API Language Support**: API endpoints MUST accept `lang` query parameter (e.g., `/api/projects/?lang=en`) and return translated content
- **Push Notifications**: `django-webpush` or `pywebpush` library (mandatory) for Web Push API backend support

### DevOps & Infrastructure Stack

- **Containerization**: Docker and Docker Compose (mandatory) for consistent environments
- **CI/CD**: GitHub Actions (mandatory) for automated deployment
- **Reverse Proxy**: Nginx (mandatory) for production
- **Version Control**: Git with GitHub (mandatory)
- **Environment Management**: `.env` files (MUST be in `.gitignore`, never committed)

### Integration Requirements
- **GitHub API**: OAuth or Personal Access Token for repository data
- **Telegram Bot API**: Simple POST requests for form notifications
- **Yandex Metrika**: Standard integration script + Webvisor 2.0 (MUST be loaded conditionally after cookie consent)
- **Google Analytics**: GA4 integration script (MUST be loaded conditionally after cookie consent)
- **Web Push API**: VAPID keys for push notification delivery (Google/Apple servers)

## Design System Requirements

### Engineering Aesthetic Philosophy

The application MUST follow "Engineering Aesthetic" design concept:
- **Visual Language**: Structure, cleanliness, and technological sophistication
- **Target Feel**: Similar to Apple presentations or Tesla control panels
- **Design Elements**: Rectangular blocks, clean lines, generous white space, modern typography

### Bento Grid Layout

- **Layout System**: MUST use Bento Grid (rectangular blocks of varying sizes) for:
  - Portfolio project cards
  - GitHub statistics display
  - Service offerings
  - Feature highlights
- **Mobile Adaptation**: On mobile devices, blocks MUST stack in single column while preserving:
  - Rounded corners
  - Consistent spacing
  - Visual hierarchy
- **Rationale**: Bento Grid provides perfect containers for portfolio cases, GitHub stats, and services while maintaining visual interest and structure

### Typography Requirements

- **Font Families**: MUST use modern sans-serif fonts (grotesques) with character:
  - **Primary**: Geist (Vercel) - preferred
  - **Alternatives**: Inter or Manrope
- **Font Loading**: MUST use Next.js `next/font` for optimal performance
- **Typography Scale**: 
  - Large headings (hero sections)
  - Generous white space between elements
  - Clear hierarchy (H1 → H6)
- **Rationale**: Typography is the primary design element. Large headings and white space create premium feel and improve readability

### Color Palette & Theme System

The application MUST use a carefully crafted color palette with semantic CSS variables for theme switching:

#### Brand Colors

- **Primary (#0FD4C8 - Neon Teal)**: 
  - **Dark Theme**: Used as primary color (buttons, active links, glow effects)
  - **Light Theme**: Used only for buttons (with black text) and icons. Too light for text on white background
  - **Primary Dark (#0B9E96)**: Darker version for hover states and links in light theme

- **Background (#0B0C0F - Deep Space)**: 
  - **Dark Theme**: Page background (`bg-background`)
  - **Light Theme**: Primary text color (`text-foreground`)
  - Rich black with cool undertone, not pure black

#### Color System Architecture

Colors MUST be organized as semantic CSS variables in `globals.css`:

**Light Theme Variables**:
- `--background`: `#F4F6F8` (slightly gray, not pure white for premium feel)
- `--card`: `#FFFFFF` (pure white for cards)
- `--foreground`: `#0B0C0F` (brand black for text)
- `--primary`: `#0FD4C8` (Neon Teal accent)
- `--primary-foreground`: `#0B0C0F` (black text on primary buttons)
- `--border`: `#E2E8F0` (subtle borders and dividers)
- `--muted`: `#64748B` (muted text for dates, captions)
- `--muted-foreground`: `#94A3B8` (lighter muted text)

**Dark Theme Variables**:
- `--background`: `#0B0C0F` (Deep Space brand black)
- `--card`: `#15171C` (slightly lighter than background for Bento grid cards)
- `--foreground`: `#F8FAFC` (almost white, not pure #FFF to avoid eye strain)
- `--primary`: `#0FD4C8` (Neon Teal accent)
- `--primary-foreground`: `#0B0C0F` (black text on primary buttons)
- `--border`: `#2D3039` (barely visible dark gray borders)
- `--muted`: `#1F2937` (muted backgrounds)
- `--muted-foreground`: `#9CA3AF` (muted text)

#### Tailwind Configuration

Tailwind config MUST extend theme with semantic color variables:

```typescript
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  border: "var(--border)",
  primary: {
    DEFAULT: "var(--primary)",
    foreground: "var(--primary-foreground)",
    dark: "#0B9E96", // For hover states
  },
  muted: {
    DEFAULT: "var(--muted)",
    foreground: "var(--muted-foreground)",
  },
}
```

#### Implementation Pattern

**globals.css Structure**:
```css
@layer base {
  :root {
    /* Light theme variables */
    --background: #F4F6F8;
    --card: #FFFFFF;
    --foreground: #0B0C0F;
    --primary: #0FD4C8;
    /* ... other variables */
  }

  .dark {
    /* Dark theme variables */
    --background: #0B0C0F;
    --card: #15171C;
    --foreground: #F8FAFC;
    --primary: #0FD4C8;
    /* ... other variables */
  }
}

@layer base {
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

#### Usage Examples

**Primary Button (Call to Action)**:
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_-5px_#0FD4C8]">
  Связаться со мной
</button>
```
- Teal (#0FD4C8) background with black text
- Neon glow effect via shadow
- Works in both themes

**Bento Grid Card**:
```tsx
<div className="bg-card border border-border rounded-2xl p-6">
  <h3 className="text-foreground text-xl font-bold">Project Name</h3>
  <p className="text-muted-foreground mt-2">Description...</p>
</div>
```
- Light theme: White card on light gray background
- Dark theme: Dark gray card (#15171C) on black background (#0B0C0F)

#### Visual Perception

- **Dark Theme (Primary for Portfolio)**: 
  - Feels like spaceship control panel or developer IDE
  - Deep black background saves battery on OLED displays
  - Teal works as laser-like accent lighting
  - Creates premium, technological atmosphere

- **Light Theme (For Reading)**:
  - Clean, strict, "medical" sterility
  - Teal used sparingly (buttons, icons only) to avoid eye strain
  - Brand black (#0B0C0F) creates high contrast and excellent readability
  - Professional and approachable

- **Rationale**: Semantic color variables allow theme switching without rewriting classes. Brand colors create consistent identity while maintaining accessibility and visual hierarchy in both themes.

### Micro-Animations (Physics-Based)

- **Library**: MUST use Framer Motion for all animations
- **Animation Principles**:
  - Buttons MUST have spring-like bounce on press
  - Page transitions MUST slide smoothly (not just fade)
  - Interactions MUST feel natural and physics-based
- **Performance**: Animations MUST not impact PageSpeed scores (use `will-change` and GPU acceleration)
- **Rationale**: Physics-based animations create premium, app-like feel. Framer Motion is industry standard for React animations

### UI Component Library (Shadcn/ui)

- **Library**: MUST use Shadcn/ui component system
- **Implementation**: Copy-paste code approach (not npm package) - components live in your codebase
- **Base**: Built on Tailwind CSS (aligns with styling requirements)
- **Customization**: Components MUST be fully customizable (they're your code)
- **Accessibility**: Components MUST support a11y (accessibility) standards out of the box
- **Rationale**: Shadcn/ui provides beautiful, accessible components without vendor lock-in. Copy-paste approach allows full control and customization

## UX Requirements (App-Like Experience)

### Mobile Navigation

- **Bottom Navigation Bar**: MUST use fixed bottom navigation bar on mobile devices (not hamburger menu)
- **Navigation Items**: MUST include: [Главная] [Портфолио] [Услуги] [Контакты]
- **Thumb Zone Optimization**: Navigation MUST be optimized for thumb reach (bottom placement)
- **Rationale**: Bottom navigation is modern standard (Instagram, Telegram). Hamburger menus are outdated and less accessible on mobile

### Gesture Support

- **Gallery Swipe**: Portfolio galleries MUST support swipe gestures for navigation
- **Bottom Sheet**: Modal dialogs (cookie settings, etc.) MUST use Drawer component (bottom sheet) that closes with swipe down gesture
- **Implementation**: MUST use Shadcn/ui Drawer component for bottom sheets
- **Rationale**: Gestures create native app feel and improve mobile UX

### Page Transitions

- **Smooth Transitions**: Page transitions MUST slide smoothly (not just appear)
- **Implementation**: MUST use Framer Motion for page transitions
- **Performance**: Transitions MUST not block rendering or impact Core Web Vitals

## PWA (Progressive Web App) Requirements

### PWA Library

- **Library**: MUST use `@serwist/next` (modern replacement for deprecated `next-pwa`)
- **Purpose**: Enables offline functionality, installability, and app-like experience

### Manifest.json Configuration

- **File**: MUST include `manifest.json` with proper configuration
- **Required Fields**:
  - `name`: Full application name (e.g., "Ivan Dev")
  - `short_name`: Short name for home screen (e.g., "Ivan")
  - `display`: MUST be `"standalone"` to remove browser UI
  - `background_color`: Background color (must match theme)
  - `theme_color`: Theme color (must match theme)
  - `start_url`: MUST be `"/"`
  - `icons`: MUST include maskable icons for Android (adapt to round/square based on device settings)
- **Rationale**: Manifest.json is the "passport" that tells phones "I am an application"

### Service Worker & Caching Strategy

- **Service Worker**: MUST be implemented via `@serwist/next`
- **Caching Strategy**: MUST use NetworkFirst strategy:
  - First attempt: Load fresh data from network
  - Fallback: If offline, show cached version of homepage and contacts
- **Offline Page**: MUST provide beautiful offline fallback page with:
  - Message: "Вы офлайн, но вот мой номер телефона, он сохранен в кэше"
  - Contact information (phone number, email)
  - Cached content accessible offline
- **Rationale**: NetworkFirst ensures fresh content when online, but provides fallback when offline

### Install Prompt

- **Custom Install Button**: MUST provide custom "Установить приложение" button in navigation/menu
- **Android/Desktop**: MUST use `beforeinstallprompt` event to show custom install prompt
- **iOS (iPhone)**: MUST show visual instruction with arrow: "Нажмите 'Поделиться' -> 'На экран домой'"
- **Rationale**: Custom install prompt is more engaging than browser's default. iOS requires manual instruction as Safari doesn't allow programmatic installation

### PWA Features Checklist

- [ ] Manifest.json configured with all required fields
- [ ] Service Worker implemented with NetworkFirst strategy
- [ ] Offline page designed and functional
- [ ] Maskable icons provided for Android
- [ ] Custom install prompt implemented
- [ ] iOS installation instructions displayed
- [ ] App installs and runs in standalone mode
- [ ] Offline functionality tested

## Push Notifications Requirements

### Use Cases

Push notifications MUST be used sparingly and only in specific scenarios:
- **Form Response**: "Уведомить меня, когда вы ответите на заявку" (if personal account exists)
- **Blog Updates**: "Сообщить о выходе новой статьи в блоге"
- **Rationale**: Push notifications are powerful but must not spam users. Clear use cases improve engagement

### Architecture

- **Frontend**: Service Worker MUST subscribe browser to push notifications and receive unique token
- **Backend**: Django MUST use `django-webpush` or `pywebpush` library to:
  - Store user tokens in database
  - Send push notifications via VAPID keys
- **Delivery**: Notifications MUST be delivered through Google/Apple servers (VAPID protocol)
- **Offline Delivery**: Notifications MUST arrive even if website is closed (service worker handles this)

### Implementation Requirements

- **Consent**: Users MUST explicitly opt-in to push notifications (separate from cookie consent)
- **Token Storage**: User push tokens MUST be stored securely in Django database
- **Admin Interface**: Django Admin MUST allow sending push notifications to users
- **VAPID Keys**: MUST be configured for Google/Apple push notification servers
- **Testing**: Push notifications MUST be tested on both Android and iOS devices

## Performance Standards

### PageSpeed Requirements
- **Target Score**: 95-100 on PageSpeed Insights (mobile and desktop)
- **Core Web Vitals**:
  - Largest Contentful Paint (LCP): < 2.5 seconds
  - First Input Delay (FID): < 100 milliseconds
  - Cumulative Layout Shift (CLS): < 0.1
- **Image Optimization**: All images MUST be converted to WebP/AVIF format
- **Code Splitting**: MUST use Next.js automatic code splitting
- **Lazy Loading**: MUST implement for all below-fold content

### Performance Testing Gates
- PageSpeed score MUST be verified before deployment
- Core Web Vitals MUST pass Google's thresholds
- Performance regression MUST block deployment

## SEO & Analytics Requirements

### Schema.org Implementation (JSON-LD) - CRITICAL FOR AI AGENTS

Schema.org разметка в формате JSON-LD является ОБЯЗАТЕЛЬНОЙ для построения Knowledge Graph в AI-агентах (ChatGPT, Perplexity, Gemini). AI-агенты не просто читают текст, они строят граф знаний и требуют четкой структурированной информации.

#### Required Schema Types

1. **Person Schema** (Главная схема - обязательна):
   - `name`: Полное имя
   - `jobTitle`: Должность (например, "Fullstack Developer & Marketer")
   - `url`: URL сайта
   - `image`: URL аватара
   - `sameAs`: МАССИВ ссылок на профили (GitHub, LinkedIn, Telegram, Хабра) - КРИТИЧНО для объединения авторитета
   - `knowsAbout`: Массив технологий (React, Next.js, Django, Python, Yandex Direct, WordPress)
   - `makesOffer`: Массив услуг (см. Offer Schema ниже)

2. **Offer Schema** (Услуги - обязательна):
   - `name`: Название услуги (например, "Разработка сайта под ключ")
   - `description`: Описание услуги
   - `priceCurrency`: Валюта (RUB)
   - `price`: Цена (если применимо)

3. **CreativeWork / SoftwareSourceCode Schema** (Портфолио проекты - обязательна):
   - `name`: Название проекта
   - `description`: Описание проекта
   - `url`: Ссылка на демо/сайт
   - `codeRepository`: Ссылка на GitHub репозиторий
   - `programmingLanguage`: Используемые технологии
   - `applicationCategory`: Категория (WebApplication, etc.)

4. **BreadcrumbList Schema** (Навигация - опционально):
   - Навигационные хлебные крошки для улучшения SEO

#### Implementation Requirements

- **Format**: JSON-LD (JavaScript Object Notation for Linked Data) - ОБЯЗАТЕЛЬНО
- **Location**: MUST be implemented in Next.js `layout.tsx` or page-specific `page.tsx`
- **Method**: Next.js `Script` component with `strategy="beforeInteractive"`
- **Dynamic Generation**: JSON-LD MUST be generated dynamically based on data from Django DRF API
- **Structure**: Each schema type MUST be a separate JSON-LD block or properly nested

#### Example Implementation Pattern

```typescript
// In app/layout.tsx or app/page.tsx
import Script from 'next/script'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Имя',
  jobTitle: 'Fullstack Developer',
  sameAs: ['https://github.com/...', 'https://t.me/...'],
  knowsAbout: ['React', 'Next.js', 'Django'],
  makesOffer: [/* Offer objects */]
}

<Script
  id="json-ld-schema"
  type="application/ld+json"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

#### Semantic HTML Requirements

In addition to JSON-LD, semantic HTML MUST be used for AI understanding:
- `<main>`: Main content area
- `<article>`: Portfolio project cards and blog posts (AI understands these as complete thoughts)
- `<nav>`: Navigation menus
- `<h1>` through `<h6>`: Proper heading hierarchy (AI scans headings to understand document structure)
- **Prohibition**: Avoid generic `<div>` containers where semantic elements are appropriate

#### Validation Requirements

Before deployment, Schema.org markup MUST be validated:
- **Google Rich Results Test**: MUST pass validation (test with localhost tunnel or production URL)
- **Schema.org Validator**: MUST pass validation at validator.schema.org
- **AI Agent Testing**: Test that ChatGPT/Perplexity can correctly identify person, services, and projects

### Google Analytics Configuration

- **Integration**: Google Analytics (GA4) MUST be integrated
- **Implementation**: Next.js integration via `next/script` or official GA4 library
- **Events Tracking**: MUST track same events as Yandex Metrika goals (form_submit, clicks, etc.)
- **Core Web Vitals**: MUST enable Core Web Vitals reporting in GA4

### Yandex Metrika Configuration

- **Webvisor 2.0**: MUST be enabled
- **Goals Configuration**:
  - `form_submit`: Successful form submission
  - `click_whatsapp`: WhatsApp link click
  - `click_telegram`: Telegram link click
  - `copy_email`: Email address copy
  - `scroll_depth_50`: 50% page scroll depth

### Analytics Integration Pattern

Both Google Analytics and Yandex Metrika MUST be integrated in Next.js:
- Use Next.js `Script` component with appropriate loading strategies
- Ensure analytics scripts don't block page rendering
- Implement event tracking consistently across both platforms

## Dark/Light Mode Implementation Requirements

### Theme Provider Setup

- **Location**: MUST wrap application in `ThemeProvider` from `next-themes` in root layout
- **Configuration**: MUST use `attribute="class"` to add `dark` class to `<html>` tag
- **Default Theme**: MUST use `defaultTheme="system"` to respect OS preferences
- **System Detection**: MUST enable `enableSystem` prop for automatic system theme detection

### Implementation Pattern

```typescript
// app/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### Tailwind CSS Dark Mode

- **Configuration**: Tailwind CSS MUST be configured for class-based dark mode
- **Styling Pattern**: All components MUST use Tailwind dark mode classes: `bg-white dark:bg-slate-900`
- **FOUC Prevention**: Theme MUST be initialized before first render to prevent FOUC
- **Testing**: MUST verify no white flash on initial page load in dark mode

## Internationalization (i18n) Implementation Requirements

### Frontend i18n (Next.js)

- **Library**: MUST use `next-intl` library
- **Middleware**: MUST implement middleware to detect `Accept-Language` header and redirect to `/ru/` or `/en/`
- **URL Structure**: MUST use language prefixes: `/ru/portfolio`, `/en/portfolio` (critical for SEO)
- **Language Switcher**: MUST provide UI component using Next.js `Link` component (no full page reload)
- **Translation Files**: MUST organize translations in `messages/ru.json` and `messages/en.json` structure

### Backend i18n (Django)

- **Library**: MUST use `django-modeltranslation` for database content translation
- **Model Fields**: Library automatically creates `_ru` and `_en` field variants (e.g., `description_ru`, `description_en`)
- **Admin Interface**: Django Admin MUST show language tabs (RU/EN) for translated fields
- **API Response**: API endpoints MUST accept `lang` query parameter and return appropriate language version
- **Example**: `GET /api/projects/?lang=en` returns English content, `GET /api/projects/?lang=ru` returns Russian content

### Language Detection Flow

1. User visits site root (`/`)
2. Middleware checks `Accept-Language` header
3. If browser language is English → redirect to `/en/`
4. If browser language is Russian → redirect to `/ru/`
5. User can manually switch language via UI component
6. Language preference SHOULD be stored in cookies/localStorage for future visits

## Cookie Consent Implementation Requirements (Privacy First)

### Privacy First Architecture

The application MUST implement Privacy First approach for cookie consent:
- **Analytics Scripts**: Yandex Metrika and Google Analytics scripts MUST NOT be loaded until user explicitly accepts analytics cookies
- **Initial Load**: Only HTML/CSS and functional cookies (theme, language) MUST be loaded on first visit
- **Consent Banner**: Cookie consent banner MUST appear on first visit (bottom center, non-intrusive)
- **Script Injection**: Analytics scripts MUST be injected into `<head>` only after user accepts analytics category
- **Performance Impact**: This approach improves PageSpeed scores for first-time visitors (analytics scripts are heavy)

### Cookie Consent Library

- **Library**: MUST use `vanilla-cookieconsent` library (pure JavaScript, no jQuery dependencies)
- **Implementation**: MUST be implemented as client component in Next.js App Router
- **Configuration**: MUST support multilingual configuration (Russian and English translations)
- **Theme Integration**: Cookie banner MUST automatically adapt to dark/light theme via CSS variables

### Cookie Categories

The application MUST categorize cookies into:

1. **Necessary Cookies** (read-only, always enabled):
   - Theme preferences (dark/light mode)
   - Language preferences (ru/en)
   - Essential site functionality
   - These cookies MUST be enabled by default and cannot be disabled

2. **Analytics Cookies** (user choice):
   - Yandex Metrika tracking
   - Google Analytics tracking
   - These cookies MUST be disabled by default and require explicit user consent

### Cookie Consent UI Requirements

- **Consent Modal**: MUST display on first visit with:
  - Title: "Мы используем cookie" (RU) / "We use cookies" (EN)
  - Description explaining cookie usage
  - "Accept All" button (primary action)
  - "Settings" button (secondary action to customize)

- **Settings Modal**: MUST provide:
  - Toggle switches for each cookie category
  - Descriptions for each category
  - "Save" button to apply preferences
  - "Accept All" button as alternative
  - Necessary cookies MUST be shown as read-only (always enabled)

- **Banner Position**: Bottom center (non-intrusive, doesn't block content)
- **Modal Layout**: Box layout with slide transition

### Cookie Consent Callbacks

The implementation MUST handle:

- **onConsent Callback**: When user accepts cookies, MUST enable analytics scripts
- **onChange Callback**: When user changes preferences, MUST enable/disable analytics accordingly
- **Revocation**: When user disables analytics, MUST remove analytics cookies and reload page to clear JavaScript state

### Cookie Consent Styling

- **Theme Integration**: Cookie banner MUST use CSS variables that adapt to dark/light theme:
  ```css
  :root {
    --cc-bg: #ffffff;
    --cc-text: #0f172a;
    --cc-btn-primary-bg: #2563eb;
  }
  .dark {
    --cc-bg: #1e293b;
    --cc-text: #f8fafc;
  }
  ```
- **Brand Consistency**: Colors MUST match site branding and theme

### Cookie Settings Access

- **Footer Link**: MUST include "Cookie Settings" link in site footer on all pages
- **Functionality**: Clicking footer link MUST open cookie settings modal (`CookieConsent.showPreferences()`)
- **Rationale**: Provides easy access to revoke consent (regulatory requirement)

### Implementation Pattern

```typescript
// CookieConsent.tsx component structure
'use client'
import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import { getConfig } from './cookieConfig';

export default function CookieBanner({ locale }: { locale: string }) {
  useEffect(() => {
    CookieConsent.run({
      ...getConfig(locale),
      onConsent: ({ cookie }) => {
        if (CookieConsent.acceptedCategory('analytics')) {
          enableAnalytics();
        }
      },
      onChange: ({ cookie }) => {
        if (CookieConsent.acceptedCategory('analytics')) {
          enableAnalytics();
        } else {
          disableAnalytics();
        }
      }
    });
  }, [locale]);
  return null;
}
```

### Analytics Script Loading Pattern

Analytics scripts MUST be loaded conditionally:

```typescript
function enableAnalytics() {
  // Check if already loaded
  if (typeof window !== 'undefined' && !window.ym) {
    // Dynamically inject Yandex Metrika script
    // Dynamically inject Google Analytics script
  }
}

function disableAnalytics() {
  // Remove analytics cookies
  // Reload page to clear JavaScript state
}
```

## Design System Requirements

### Engineering Aesthetic Philosophy

The application MUST follow "Engineering Aesthetic" design concept:
- **Visual Language**: Structure, cleanliness, and technological sophistication
- **Target Feel**: Similar to Apple presentations or Tesla control panels
- **Design Elements**: Rectangular blocks, clean lines, generous white space, modern typography

### Bento Grid Layout

- **Layout System**: MUST use Bento Grid (rectangular blocks of varying sizes) for:
  - Portfolio project cards
  - GitHub statistics display
  - Service offerings
  - Feature highlights
- **Mobile Adaptation**: On mobile devices, blocks MUST stack in single column while preserving:
  - Rounded corners
  - Consistent spacing
  - Visual hierarchy
- **Rationale**: Bento Grid provides perfect containers for portfolio cases, GitHub stats, and services while maintaining visual interest and structure

### Typography Requirements

- **Font Families**: MUST use modern sans-serif fonts (grotesques) with character:
  - **Primary**: Geist (Vercel) - preferred
  - **Alternatives**: Inter or Manrope
- **Font Loading**: MUST use Next.js `next/font` for optimal performance
- **Typography Scale**: 
  - Large headings (hero sections)
  - Generous white space between elements
  - Clear hierarchy (H1 → H6)
- **Rationale**: Typography is the primary design element. Large headings and white space create premium feel and improve readability

### Color Palette & Theme System

The application MUST use a carefully crafted color palette with semantic CSS variables for theme switching:

#### Brand Colors

- **Primary (#0FD4C8 - Neon Teal)**: 
  - **Dark Theme**: Used as primary color (buttons, active links, glow effects)
  - **Light Theme**: Used only for buttons (with black text) and icons. Too light for text on white background
  - **Primary Dark (#0B9E96)**: Darker version for hover states and links in light theme

- **Background (#0B0C0F - Deep Space)**: 
  - **Dark Theme**: Page background (`bg-background`)
  - **Light Theme**: Primary text color (`text-foreground`)
  - Rich black with cool undertone, not pure black

#### Color System Architecture

Colors MUST be organized as semantic CSS variables in `globals.css`:

**Light Theme Variables**:
- `--background`: `#F4F6F8` (slightly gray, not pure white for premium feel)
- `--card`: `#FFFFFF` (pure white for cards)
- `--foreground`: `#0B0C0F` (brand black for text)
- `--primary`: `#0FD4C8` (Neon Teal accent)
- `--primary-foreground`: `#0B0C0F` (black text on primary buttons)
- `--border`: `#E2E8F0` (subtle borders and dividers)
- `--muted`: `#64748B` (muted text for dates, captions)
- `--muted-foreground`: `#94A3B8` (lighter muted text)

**Dark Theme Variables**:
- `--background`: `#0B0C0F` (Deep Space brand black)
- `--card`: `#15171C` (slightly lighter than background for Bento grid cards)
- `--foreground`: `#F8FAFC` (almost white, not pure #FFF to avoid eye strain)
- `--primary`: `#0FD4C8` (Neon Teal accent)
- `--primary-foreground`: `#0B0C0F` (black text on primary buttons)
- `--border`: `#2D3039` (barely visible dark gray borders)
- `--muted`: `#1F2937` (muted backgrounds)
- `--muted-foreground`: `#9CA3AF` (muted text)

#### Tailwind Configuration

Tailwind config MUST extend theme with semantic color variables:

```typescript
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  border: "var(--border)",
  primary: {
    DEFAULT: "var(--primary)",
    foreground: "var(--primary-foreground)",
    dark: "#0B9E96", // For hover states
  },
  muted: {
    DEFAULT: "var(--muted)",
    foreground: "var(--muted-foreground)",
  },
}
```

#### Implementation Pattern

**globals.css Structure**:
```css
@layer base {
  :root {
    /* Light theme variables */
    --background: #F4F6F8;
    --card: #FFFFFF;
    --foreground: #0B0C0F;
    --primary: #0FD4C8;
    /* ... other variables */
  }

  .dark {
    /* Dark theme variables */
    --background: #0B0C0F;
    --card: #15171C;
    --foreground: #F8FAFC;
    --primary: #0FD4C8;
    /* ... other variables */
  }
}

@layer base {
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

#### Usage Examples

**Primary Button (Call to Action)**:
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_-5px_#0FD4C8]">
  Связаться со мной
</button>
```
- Teal (#0FD4C8) background with black text
- Neon glow effect via shadow
- Works in both themes

**Bento Grid Card**:
```tsx
<div className="bg-card border border-border rounded-2xl p-6">
  <h3 className="text-foreground text-xl font-bold">Project Name</h3>
  <p className="text-muted-foreground mt-2">Description...</p>
</div>
```
- Light theme: White card on light gray background
- Dark theme: Dark gray card (#15171C) on black background (#0B0C0F)

#### Visual Perception

- **Dark Theme (Primary for Portfolio)**: 
  - Feels like spaceship control panel or developer IDE
  - Deep black background saves battery on OLED displays
  - Teal works as laser-like accent lighting
  - Creates premium, technological atmosphere

- **Light Theme (For Reading)**:
  - Clean, strict, "medical" sterility
  - Teal used sparingly (buttons, icons only) to avoid eye strain
  - Brand black (#0B0C0F) creates high contrast and excellent readability
  - Professional and approachable

- **Rationale**: Semantic color variables allow theme switching without rewriting classes. Brand colors create consistent identity while maintaining accessibility and visual hierarchy in both themes.

### Micro-Animations (Physics-Based)

- **Library**: MUST use Framer Motion for all animations
- **Animation Principles**:
  - Buttons MUST have spring-like bounce on press
  - Page transitions MUST slide smoothly (not just fade)
  - Interactions MUST feel natural and physics-based
- **Performance**: Animations MUST not impact PageSpeed scores (use `will-change` and GPU acceleration)
- **Rationale**: Physics-based animations create premium, app-like feel. Framer Motion is industry standard for React animations

### UI Component Library (Shadcn/ui)

- **Library**: MUST use Shadcn/ui component system
- **Implementation**: Copy-paste code approach (not npm package) - components live in your codebase
- **Base**: Built on Tailwind CSS (aligns with styling requirements)
- **Customization**: Components MUST be fully customizable (they're your code)
- **Accessibility**: Components MUST support a11y (accessibility) standards out of the box
- **Rationale**: Shadcn/ui provides beautiful, accessible components without vendor lock-in. Copy-paste approach allows full control and customization

## UX Requirements (App-Like Experience)

### Mobile Navigation

- **Bottom Navigation Bar**: MUST use fixed bottom navigation bar on mobile devices (not hamburger menu)
- **Navigation Items**: MUST include: [Главная] [Портфолио] [Услуги] [Контакты]
- **Thumb Zone Optimization**: Navigation MUST be optimized for thumb reach (bottom placement)
- **Rationale**: Bottom navigation is modern standard (Instagram, Telegram). Hamburger menus are outdated and less accessible on mobile

### Gesture Support

- **Gallery Swipe**: Portfolio galleries MUST support swipe gestures for navigation
- **Bottom Sheet**: Modal dialogs (cookie settings, etc.) MUST use Drawer component (bottom sheet) that closes with swipe down gesture
- **Implementation**: MUST use Shadcn/ui Drawer component for bottom sheets
- **Rationale**: Gestures create native app feel and improve mobile UX

### Page Transitions

- **Smooth Transitions**: Page transitions MUST slide smoothly (not just appear)
- **Implementation**: MUST use Framer Motion for page transitions
- **Performance**: Transitions MUST not block rendering or impact Core Web Vitals

## PWA (Progressive Web App) Requirements

### PWA Library

- **Library**: MUST use `@serwist/next` (modern replacement for deprecated `next-pwa`)
- **Purpose**: Enables offline functionality, installability, and app-like experience

### Manifest.json Configuration

- **File**: MUST include `manifest.json` with proper configuration
- **Required Fields**:
  - `name`: Full application name (e.g., "Ivan Dev")
  - `short_name`: Short name for home screen (e.g., "Ivan")
  - `display`: MUST be `"standalone"` to remove browser UI
  - `background_color`: Background color (must match theme)
  - `theme_color`: Theme color (must match theme)
  - `start_url`: MUST be `"/"`
  - `icons`: MUST include maskable icons for Android (adapt to round/square based on device settings)
- **Rationale**: Manifest.json is the "passport" that tells phones "I am an application"

### Service Worker & Caching Strategy

- **Service Worker**: MUST be implemented via `@serwist/next`
- **Caching Strategy**: MUST use NetworkFirst strategy:
  - First attempt: Load fresh data from network
  - Fallback: If offline, show cached version of homepage and contacts
- **Offline Page**: MUST provide beautiful offline fallback page with:
  - Message: "Вы офлайн, но вот мой номер телефона, он сохранен в кэше"
  - Contact information (phone number, email)
  - Cached content accessible offline
- **Rationale**: NetworkFirst ensures fresh content when online, but provides fallback when offline

### Install Prompt

- **Custom Install Button**: MUST provide custom "Установить приложение" button in navigation/menu
- **Android/Desktop**: MUST use `beforeinstallprompt` event to show custom install prompt
- **iOS (iPhone)**: MUST show visual instruction with arrow: "Нажмите 'Поделиться' -> 'На экран домой'"
- **Rationale**: Custom install prompt is more engaging than browser's default. iOS requires manual instruction as Safari doesn't allow programmatic installation

### PWA Features Checklist

- [ ] Manifest.json configured with all required fields
- [ ] Service Worker implemented with NetworkFirst strategy
- [ ] Offline page designed and functional
- [ ] Maskable icons provided for Android
- [ ] Custom install prompt implemented
- [ ] iOS installation instructions displayed
- [ ] App installs and runs in standalone mode
- [ ] Offline functionality tested

## Push Notifications Requirements

### Use Cases

Push notifications MUST be used sparingly and only in specific scenarios:
- **Form Response**: "Уведомить меня, когда вы ответите на заявку" (if personal account exists)
- **Blog Updates**: "Сообщить о выходе новой статьи в блоге"
- **Rationale**: Push notifications are powerful but must not spam users. Clear use cases improve engagement

### Architecture

- **Frontend**: Service Worker MUST subscribe browser to push notifications and receive unique token
- **Backend**: Django MUST use `django-webpush` or `pywebpush` library to:
  - Store user tokens in database
  - Send push notifications via VAPID keys
- **Delivery**: Notifications MUST be delivered through Google/Apple servers (VAPID protocol)
- **Offline Delivery**: Notifications MUST arrive even if website is closed (service worker handles this)

### Implementation Requirements

- **Consent**: Users MUST explicitly opt-in to push notifications (separate from cookie consent)
- **Token Storage**: User push tokens MUST be stored securely in Django database
- **Admin Interface**: Django Admin MUST allow sending push notifications to users
- **VAPID Keys**: MUST be configured for Google/Apple push notification servers
- **Testing**: Push notifications MUST be tested on both Android and iOS devices

## Legal Compliance Requirements (152-ФЗ)

### Personal Data Collection Forms

- **Consent Checkbox**: ALL forms collecting personal data (name, phone, email) MUST include consent checkbox
- **Checkbox Text**: MUST display: "Я даю согласие на обработку персональных данных в соответствии с Политикой конфиденциальности"
- **Checkbox State**: Checkbox MAY be pre-checked by default, but user MUST be able to uncheck it
- **Form Validation**: Submit button MUST be disabled if consent checkbox is unchecked
- **Consent Storage**: Consent status MUST be stored with form submission data

### Privacy Policy Page

- **Location**: MUST be accessible at `/privacy` route (or `/ru/privacy` and `/en/privacy` for i18n)
- **Footer Link**: MUST be linked from site footer on all pages
- **Content**: MUST use standard 152-ФЗ compliant privacy policy template
- **Personal Information**: Template MUST be filled with actual personal information (name, contacts)
- **Format**: MAY be HTML page or downloadable PDF file
- **Accessibility**: MUST be accessible without authentication

### Privacy Policy Template Requirements

Privacy policy MUST include standard sections:
- Data controller information (personal name and contacts)
- Types of personal data collected
- Purpose of data processing
- Legal basis for processing
- Data retention period
- User rights (access, correction, deletion)
- Contact information for data protection inquiries
- Cookie usage information and categories

### Cookie Consent Legal Requirements

- **Informed Consent**: Users MUST be informed about cookie usage before any analytics cookies are set
- **Granular Control**: Users MUST be able to accept/reject analytics cookies separately from necessary cookies
- **Easy Revocation**: Users MUST be able to revoke consent at any time via footer link or settings modal
- **No Pre-checked Analytics**: Analytics cookies MUST be disabled by default (opt-in, not opt-out)
- **Transparency**: Cookie descriptions MUST clearly explain what each category does

## Page Structure Requirements

### Mandatory Pages
1. **Hero Section (Homepage)**:
   - Unique Selling Proposition (USP): "Разрабатываю сложные веб-приложения и эффективные маркетинговые связки"
   - Tech stack icons with animation: React, Python, Docker, WP, Yandex Direct

2. **Portfolio Page**:
   - Filter tabs: [Все] [Веб-приложения] [Сайты на WP/Bitrix] [Рекламные кейсы]
   - Pet projects: GitHub link + Deploy link
   - Commercial projects: Website link + Business results (ROI, conversion)

3. **About Me Page**:
   - Dynamic GitHub contribution graph (via GitHub API)
   - Shows active coding activity

4. **Services & Prices Page**:
   - Clear separation: "Сайт под ключ" vs "Разработка на React/Python" vs "Настройка Директа"

5. **Contacts / Lead Magnet Page**:
   - Contact form (MUST send to Telegram)
   - Contact form MUST include 152-ФЗ consent checkbox
   - Contact information

6. **Privacy Policy Page** (Mandatory for 152-ФЗ compliance):
   - Accessible at `/privacy` (or `/ru/privacy` and `/en/privacy`)
   - MUST be linked from footer on all pages
   - MUST contain 152-ФЗ compliant privacy policy content

7. **Footer** (Mandatory component on all pages):
   - MUST include "Privacy Policy" link
   - MUST include "Cookie Settings" link (opens cookie consent settings modal)
   - MUST be accessible on all pages

### Optional Pages
- **Blog**: Articles about technical topics (e.g., "Как я подружил Bitrix с React", "Оптимизация рекламы")

## CI/CD & Deployment Requirements

### Project Structure

The project MUST follow this structure for Docker Compose and CI/CD:

```text
my-project/
├── frontend/              # Next.js application
├── backend/               # Django application
├── nginx/                 # Nginx configuration files
├── .github/               # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml     # Deployment workflow
├── .env                   # Local secrets (MUST be in .gitignore)
├── docker-compose.yml     # Base Docker Compose configuration
└── docker-compose.prod.yml # Production-specific overrides
```

### Docker Compose Configuration

- **Local Development**: MUST use `docker-compose.yml` with:
  - Hot reload enabled via volumes for frontend (`npm run dev`)
  - Hot reload enabled via volumes for backend (`python manage.py runserver`)
  - PostgreSQL database service
  - Volume mounts for instant code updates

- **Production**: MUST use `docker-compose.prod.yml` overrides for:
  - Optimized Next.js build (production mode)
  - Static file serving
  - Environment-specific settings

### GitHub Actions Workflow

- **Trigger**: MUST deploy automatically on push to `main` branch
- **Workflow File**: MUST be located at `.github/workflows/deploy.yml`
- **Steps**:
  1. Checkout code
  2. Run tests (optional but recommended - deployment stops if tests fail)
  3. SSH connection to production server
  4. Git pull latest code
  5. Rebuild Docker containers with production config
  6. Run database migrations
  7. Collect static files (Django)
  8. Clean up old Docker images

### GitHub Secrets Configuration

The following secrets MUST be configured in GitHub repository settings:
- `HOST`: Production server IP address
- `USERNAME`: SSH username (typically `root`)
- `SSH_KEY`: Private SSH key content (for server access)
- `PASSPHRASE`: SSH key passphrase (if applicable, better without for CI)

### Dockerfile Requirements

**Frontend Dockerfile** MUST use multi-stage build:
- **Builder Stage**: Install dependencies and build Next.js application
- **Runner Stage**: Copy only built files and production dependencies
- **Result**: Reduced image size from ~1GB to ~100MB

**Backend Dockerfile** MUST:
- Use Python base image
- Install dependencies from requirements.txt
- Set up Django application
- Expose appropriate port

### Deployment Process

**Automated Workflow**:
1. Developer commits and pushes to `main` branch
2. GitHub Actions detects push
3. Workflow runs on GitHub runner
4. SSH connection established to production server
5. Code pulled from repository
6. Docker containers rebuilt
7. Database migrations applied
8. Static files collected
9. Services restarted
10. Old images cleaned up

**Deployment Time**: Target 2-3 minutes from push to live site

### Server Initial Setup (One-Time Manual Steps)

Production server MUST be prepared with:
1. Docker and Docker Compose installed
2. SSH keys generated (`ssh-keygen`)
3. Repository cloned (`git clone`)
4. `.env` file created on server (NOT in repository)
5. Initial containers started

### Security Requirements

- **`.gitignore` MUST exclude**:
  - `node_modules/`
  - `__pycache__/`
  - `.env` (critical - never commit secrets)
  - `.vscode/`
  - `media/` (user-uploaded files)
  - `*.log`

- **Environment Variables**: 
  - Local `.env` files MUST never be committed
  - Production `.env` MUST be created directly on server
  - Secrets MUST be stored in GitHub Secrets, not in code

### Local Development Workflow

**Developer Process**:
1. Write code in VS Code
2. Run `docker compose up` locally
3. Test changes with hot reload
4. Commit changes: `git commit -m "message"`
5. Push to main: `git push origin main`
6. GitHub Actions automatically deploys
7. Changes live in 2-3 minutes

**Rationale**: This workflow eliminates "works on my machine" problems and ensures production environment matches development.

## Development Workflow

### Code Quality Gates
- All features MUST pass PageSpeed validation before merge
- Mobile-first design MUST be verified on actual devices or emulators
- Schema.org markup MUST be validated before deployment
- Yandex Metrika goals MUST be tested before deployment
- Dark/Light mode MUST be tested for FOUC (no white flash on initial load)
- i18n MUST be tested for both Russian and English languages
- Form consent checkboxes MUST be tested for 152-ФЗ compliance
- Cookie consent banner MUST be tested (appears on first visit, analytics scripts don't load until accepted)
- Cookie settings modal MUST be tested (categories, toggles, save functionality)
- Cookie consent revocation MUST be tested (footer link, analytics scripts disabled after revocation)

### Testing Requirements
- Performance testing: PageSpeed Insights on every deployment
- Mobile testing: Verify responsive design on multiple screen sizes
- Integration testing: Verify GitHub API and Telegram Bot integrations
- SEO validation: 
  - Schema.org markup MUST be validated with Google Rich Results Test
  - Schema.org markup MUST be validated with Schema.org Validator
  - Test AI agent understanding (ChatGPT/Perplexity) of structured data
- Theme testing: Verify dark/light mode switching, FOUC prevention, system theme detection
- i18n testing: Verify language detection, URL structure, translation completeness for both RU and EN
- Legal compliance testing: 
  - Verify consent checkbox behavior, privacy policy accessibility, 152-ФЗ compliance
  - Verify cookie consent banner appears on first visit
  - Verify analytics scripts don't load until user accepts
  - Verify cookie settings modal functionality (categories, toggles, save)
  - Verify cookie consent revocation via footer link
  - Verify analytics scripts are disabled after revocation

### Deployment Checklist
- [ ] PageSpeed score ≥ 95
- [ ] Core Web Vitals pass thresholds
- [ ] Mobile responsive design verified
- [ ] Schema.org JSON-LD markup validated (Google Rich Results Test + Schema.org Validator)
- [ ] Person Schema with `sameAs` array properly configured
- [ ] Offer Schema for all services configured
- [ ] CreativeWork/SoftwareSourceCode Schema for portfolio projects configured
- [ ] Semantic HTML verified (`<main>`, `<article>`, proper heading hierarchy)
- [ ] Google Analytics (GA4) integrated and tested (loads conditionally after cookie consent)
- [ ] Yandex Metrika goals configured and tested (loads conditionally after cookie consent)
- [ ] Dark/Light mode implemented with `next-themes` and Tailwind CSS
- [ ] FOUC prevention verified (no white flash on dark mode)
- [ ] Theme switching tested (system, light, dark modes)
- [ ] i18n implemented with `next-intl` (frontend) and `django-modeltranslation` (backend)
- [ ] Language detection middleware tested (redirects to `/ru/` or `/en/`)
- [ ] Both Russian and English translations complete
- [ ] Language switcher UI component working (no full page reload)
- [ ] API language parameter tested (`?lang=ru` and `?lang=en`)
- [ ] Cookie consent implemented with `vanilla-cookieconsent` library
- [ ] Privacy First approach verified (analytics scripts don't load until user accepts)
- [ ] Cookie consent banner appears on first visit (bottom center)
- [ ] Cookie settings modal functional (categories, toggles, save)
- [ ] Cookie consent supports both Russian and English
- [ ] Cookie banner adapts to dark/light theme
- [ ] "Cookie Settings" link present in footer on all pages
- [ ] Analytics scripts load conditionally after consent
- [ ] Cookie consent revocation tested (analytics disabled after revocation)
- [ ] Color palette configured in globals.css (semantic CSS variables for light/dark themes)
- [ ] Tailwind config extended with semantic color variables (background, foreground, card, primary, etc.)
- [ ] Brand colors implemented: Primary (#0FD4C8), Primary Dark (#0B9E96), Background (#0B0C0F)
- [ ] Theme switching tested (colors adapt correctly in light/dark modes)
- [ ] Shadcn/ui components installed and customized
- [ ] Framer Motion animations implemented (buttons, page transitions)
- [ ] Bento Grid layout implemented for portfolio and services
- [ ] Modern typography (Geist/Inter/Manrope) configured with next/font
- [ ] Bottom navigation bar implemented on mobile (not hamburger menu)
- [ ] Drawer component (bottom sheet) implemented for modals
- [ ] Swipe gestures implemented for galleries
- [ ] PWA configured with @serwist/next
- [ ] Manifest.json configured (standalone mode, maskable icons)
- [ ] Service Worker implemented (NetworkFirst caching strategy)
- [ ] Offline page designed and functional
- [ ] Custom install prompt implemented (Android/Desktop)
- [ ] iOS installation instructions displayed
- [ ] Push notifications backend configured (django-webpush or pywebpush)
- [ ] Push notification consent flow implemented
- [ ] Push notifications tested (subscription, delivery)
- [ ] Docker Compose configured for local development (hot reload enabled)
- [ ] Docker Compose production config created (docker-compose.prod.yml)
- [ ] Frontend Dockerfile uses multi-stage build (optimized size)
- [ ] Backend Dockerfile configured
- [ ] GitHub Actions workflow created (.github/workflows/deploy.yml)
- [ ] GitHub Secrets configured (HOST, USERNAME, SSH_KEY)
- [ ] .gitignore properly configured (.env excluded)
- [ ] CI/CD pipeline tested (push to main triggers deployment)
- [ ] Deployment process verified (code → GitHub → server → live site)
- [ ] 152-ФЗ compliance verified:
  - [ ] Consent checkbox present in all forms collecting personal data
  - [ ] Consent checkbox can be unchecked (submit button disabled when unchecked)
  - [ ] Privacy policy page accessible at `/privacy` (or `/ru/privacy` and `/en/privacy`)
  - [ ] Privacy policy linked from footer
  - [ ] Privacy policy contains 152-ФЗ compliant content
  - [ ] Cookie usage information included in privacy policy
- [ ] GitHub API integration working
- [ ] Telegram Bot notifications working
- [ ] All images optimized (WebP/AVIF)

## Governance

### Constitution Supremacy
This constitution supersedes all other development practices and decisions. Any deviation MUST be justified and documented.

### Amendment Process
- Amendments require documentation of rationale
- Version increments follow semantic versioning:
  - **MAJOR**: Backward incompatible principle changes
  - **MINOR**: New principles or major section additions
  - **PATCH**: Clarifications, wording improvements
- All amendments MUST be reviewed against performance and SEO impact

### Compliance Review
- All pull requests MUST verify compliance with constitution principles
- Performance regressions MUST be addressed before merge
- Any complexity additions MUST be justified against simpler alternatives
- Integration requirements MUST be verified before feature completion

**Version**: 1.5.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
