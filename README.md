# Fullstack PWA Portfolio

A production-ready Fullstack PWA portfolio application using Next.js (App Router) for the frontend and Django REST Framework for the backend.

## Features

- 🎨 Bento Grid portfolio layout with category filtering
- 📧 Contact form with 152-ФЗ compliance
- 🌐 Internationalization (Russian/English)
- 📱 Progressive Web App (PWA) with offline support
- 🍪 Cookie consent management
- 📊 GitHub activity integration
- 🎯 Dark/Light theme support

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Framer Motion
- **Backend**: Django 4.2+, Django REST Framework, PostgreSQL
- **Infrastructure**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd devbutakov
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration (Telegram Bot token, GitHub token, etc.)

4. Start all services:
```bash
docker compose up
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### Local Development (without Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
devbutakov/
├── backend/          # Django REST API
├── frontend/         # Next.js application
├── nginx/            # Nginx configuration
├── specs/            # Feature specifications
└── docker-compose.yml
```

## Documentation

- Feature Specification: `specs/001-fullstack-pwa-portfolio/spec.md`
- Implementation Plan: `specs/001-fullstack-pwa-portfolio/plan.md`
- Tasks: `specs/001-fullstack-pwa-portfolio/tasks.md`

## License

[Your License Here]

