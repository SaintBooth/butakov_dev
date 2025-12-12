# Quickstart Guide: Fullstack PWA Portfolio

**Feature**: 001-fullstack-pwa-portfolio  
**Date**: 2025-01-27

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- GitHub account (for repository)
- Telegram Bot token (for notifications)
- GitHub Personal Access Token (for contribution graph)

## Initial Setup

### 1. Clone Repository

```bash
git clone git@github.com:your-username/portfolio-project.git
cd portfolio-project
```

### 2. Environment Configuration

Create `.env` file in project root (copy from `.env.example`):

```bash
# Backend (Django)
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DATABASE_URL=postgresql://user:password@db:5432/portfolio_db

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# GitHub API
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_USERNAME=your-github-username

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: Never commit `.env` file to git!

### 3. Start Development Environment

```bash
docker compose up --build
```

This will:
- Start PostgreSQL database
- Start Django backend on http://localhost:8000
- Start Next.js frontend on http://localhost:3000
- Enable hot reload for both services

### 4. Initialize Database

In a new terminal:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 5. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## Development Workflow

### Adding a New Project

1. Access Django Admin: http://localhost:8000/admin/
2. Navigate to "Projects"
3. Click "Add Project"
4. Fill in:
   - Title (RU and EN)
   - Description (RU and EN)
   - Category (Web Dev/Marketing/Pet Project)
   - Tags
   - Featured Image
   - Demo URL (optional)
   - GitHub URL (optional)
5. Save

### Testing Contact Form

1. Navigate to http://localhost:3000/ru/contact (or /en/contact)
2. Fill out the form
3. Check consent checkbox
4. Submit
5. Verify:
   - Submission appears in Django Admin
   - Telegram notification received

### Testing Language Switching

1. Visit http://localhost:3000/
2. Browser language detection should redirect to `/ru/` or `/en/`
3. Click language switcher
4. Verify content updates without page reload

### Testing Dark/Light Mode

1. Toggle theme using theme switcher
2. Verify no FOUC (Flash of Unstyled Content)
3. Verify theme persists across page navigation

### Testing Cookie Consent

1. Open site in incognito/private window
2. Cookie banner should appear
3. Click "Accept All"
4. Verify analytics scripts load (check Network tab)
5. Click "Cookie Settings" in footer
6. Disable analytics cookies
7. Verify analytics scripts are removed

## Common Tasks

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Run Database Migrations

```bash
docker compose exec backend python manage.py migrate
```

### Collect Static Files (Django)

```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### Create Django Superuser

```bash
docker compose exec backend python manage.py createsuperuser
```

### Access Django Shell

```bash
docker compose exec backend python manage.py shell
```

### Rebuild Containers

```bash
docker compose up --build
```

### Stop Services

```bash
docker compose down
```

### Clean Up (Remove volumes)

```bash
docker compose down -v
```

## Troubleshooting

### Port Already in Use

If port 3000 or 8000 is already in use:

1. Stop the conflicting service
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change 3000 to 3001
   ```

### Database Connection Error

1. Verify PostgreSQL container is running: `docker compose ps`
2. Check database credentials in `.env`
3. Restart database: `docker compose restart db`

### Frontend Not Updating

1. Check if hot reload is enabled (volumes mounted)
2. Clear Next.js cache: `docker compose exec frontend rm -rf .next`
3. Restart frontend: `docker compose restart frontend`

### API CORS Errors

1. Verify `CORS_ALLOWED_ORIGINS` in Django settings includes frontend URL
2. Check browser console for specific CORS error
3. Restart backend: `docker compose restart backend`

## Production Deployment

See CI/CD & Deployment Requirements in constitution for production setup.

## Next Steps

1. Add initial content via Django Admin
2. Customize design system colors and typography
3. Add more portfolio projects
4. Test on mobile devices
5. Run PageSpeed Insights and optimize
6. Set up production environment

