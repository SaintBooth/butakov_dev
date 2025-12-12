# Research: Fullstack PWA Portfolio

**Feature**: 001-fullstack-pwa-portfolio  
**Date**: 2025-01-27

## Technology Decisions

### Next.js App Router vs Pages Router

**Decision**: Use Next.js App Router (latest stable version)

**Rationale**: 
- App Router is the modern, recommended approach for Next.js 13+
- Better support for React Server Components
- Improved performance with streaming and Suspense
- Better TypeScript support
- Aligns with constitution requirement for modern stack

**Alternatives considered**: 
- Pages Router: Older approach, still supported but not recommended for new projects
- Remix/Other frameworks: Next.js has better ecosystem and documentation

### Django REST Framework API Design

**Decision**: Use REST API with standard endpoints (`/api/projects/`, `/api/contact/`)

**Rationale**:
- REST is industry standard and well-understood
- Easy to consume from Next.js frontend
- Good tooling and documentation
- Supports language parameter via query string (`?lang=ru`)

**Alternatives considered**:
- GraphQL: More complex setup, overkill for simple CRUD operations
- tRPC: Requires TypeScript on backend, adds complexity

### Docker Compose Structure

**Decision**: Monorepo with separate services (db, backend, frontend) in single docker-compose.yml

**Rationale**:
- Allows development of both frontend and backend simultaneously
- Hot reload for both services in development
- Matches production deployment structure
- Single command to start entire stack (`docker compose up`)

**Alternatives considered**:
- Separate repositories: More complex CI/CD, harder to keep in sync
- Single container: Doesn't allow independent scaling, harder to debug

### State Management

**Decision**: React Server Components + Client Components with minimal state management

**Rationale**:
- Next.js App Router encourages Server Components for data fetching
- Minimal client-side state needed (form state, theme, language)
- No need for Redux/Zustand for this scope
- Simpler codebase, better performance

**Alternatives considered**:
- Redux: Overkill for portfolio site, adds complexity
- Zustand: Could be useful but not necessary for current scope

### Form Validation

**Decision**: Zod for client-side validation

**Rationale**:
- TypeScript-first validation library
- Excellent TypeScript inference
- Works well with React Hook Form (if needed)
- Type-safe validation schemas

**Alternatives considered**:
- Yup: Older, less TypeScript-friendly
- Manual validation: More error-prone, harder to maintain

### GitHub API Integration

**Decision**: Use GitHub REST API v4 with Personal Access Token

**Rationale**:
- Simple REST API, well-documented
- Personal Access Token sufficient for public repository data
- No OAuth complexity needed for read-only data
- Rate limiting manageable with caching

**Alternatives considered**:
- GitHub GraphQL API: More complex, not necessary for contribution graph
- OAuth: Unnecessary complexity for public data

### Telegram Bot Integration

**Decision**: Use Telegram Bot API via HTTP requests (python-telegram-bot library)

**Rationale**:
- Simple HTTP API
- Reliable delivery
- Free for basic usage
- Easy to integrate in Django

**Alternatives considered**:
- Email notifications: Less immediate, can go to spam
- Webhooks: More complex setup, not necessary for simple notifications

### Caching Strategy

**Decision**: NetworkFirst for Service Worker, API response caching in Next.js

**Rationale**:
- NetworkFirst ensures fresh content when online
- Falls back to cache when offline
- API caching reduces load on Django backend
- Aligns with PWA requirements

**Alternatives considered**:
- CacheFirst: Could serve stale content
- StaleWhileRevalidate: More complex, not necessary for portfolio site

## Best Practices Research

### Next.js App Router Best Practices

- Use Server Components by default, Client Components only when needed
- Implement proper loading and error states
- Use Suspense boundaries for better UX
- Optimize images with next/image
- Use next/font for font loading

### Django REST Framework Best Practices

- Use serializers for data validation
- Implement pagination for list endpoints
- Add proper CORS configuration
- Use Django signals for side effects (Telegram notifications)
- Implement proper error handling

### Docker Best Practices

- Use multi-stage builds for production
- Keep images small (alpine base images)
- Use .dockerignore to exclude unnecessary files
- Separate development and production configs
- Use environment variables for configuration

### PWA Best Practices

- Provide meaningful offline fallback
- Use maskable icons for Android
- Implement proper caching strategies
- Test on multiple devices
- Provide clear install instructions for iOS

## Integration Patterns

### GitHub API Integration Pattern

1. Fetch contribution data on server-side (Next.js API route or Server Component)
2. Cache responses to avoid rate limiting
3. Handle errors gracefully with fallback UI
4. Use GitHub's contribution graph API or calculate from commits

### Telegram Bot Integration Pattern

1. Create Telegram bot via BotFather
2. Store bot token in environment variables
3. Send message via HTTP POST to Telegram API
4. Handle errors (log, don't break form submission)
5. Use Django signal to trigger on ContactSubmission creation

### Cookie Consent Integration Pattern

1. Load vanilla-cookieconsent on client-side
2. Check consent status before loading analytics scripts
3. Use callbacks to enable/disable analytics
4. Store consent in localStorage/cookies
5. Provide settings modal for granular control

## Performance Optimization Strategies

### Frontend Optimization

- Use Next.js Image component for automatic optimization
- Implement code splitting with dynamic imports
- Use React Server Components to reduce JavaScript bundle
- Optimize fonts with next/font
- Lazy load below-fold content

### Backend Optimization

- Use database indexes on frequently queried fields
- Implement API response caching
- Use select_related/prefetch_related for queries
- Optimize database queries
- Use connection pooling

### Build Optimization

- Multi-stage Docker builds
- Minimize dependencies
- Use production builds (Next.js production mode)
- Optimize bundle size
- Tree-shaking unused code

## Security Considerations

### API Security

- CORS configuration for frontend domain only
- Rate limiting on contact form endpoint
- Input validation and sanitization
- SQL injection prevention (Django ORM handles this)
- XSS prevention (React escapes by default)

### Environment Variables

- Never commit .env files
- Use different secrets for development/production
- Rotate API keys regularly
- Use GitHub Secrets for CI/CD
- Store secrets securely on production server

### Data Protection

- Encrypt sensitive data in database
- Use HTTPS in production
- Implement proper consent mechanisms (152-ФЗ)
- Secure cookie settings
- Regular security updates

## Deployment Considerations

### VPS Requirements

- Minimum 2GB RAM (for Docker containers)
- 20GB+ storage (for images and builds)
- Ubuntu 22.04 LTS or similar
- Docker and Docker Compose installed
- Nginx for reverse proxy

### CI/CD Pipeline

- GitHub Actions for automation
- SSH deployment to VPS
- Automated testing (if tests exist)
- Database migrations
- Static file collection
- Container rebuild and restart

### Monitoring

- Application logs (Docker logs)
- Error tracking (optional: Sentry)
- Performance monitoring (PageSpeed Insights)
- Uptime monitoring (optional: UptimeRobot)

## Open Questions Resolved

All technical decisions have been made. No outstanding clarifications needed.

## References

- Next.js App Router Documentation: https://nextjs.org/docs/app
- Django REST Framework: https://www.django-rest-framework.org/
- Docker Compose: https://docs.docker.com/compose/
- GitHub API: https://docs.github.com/en/rest
- Telegram Bot API: https://core.telegram.org/bots/api
- PWA Best Practices: https://web.dev/pwa-checklist/

