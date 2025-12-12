# Data Model: Fullstack PWA Portfolio

**Feature**: 001-fullstack-pwa-portfolio  
**Date**: 2025-01-27

## Entity: Project

**Purpose**: Represents a portfolio project/work item displayed on the portfolio page.

### Attributes

- `id` (Integer, Primary Key, Auto-increment)
- `title` (String, max_length=200, required)
- `title_ru` (String, max_length=200, optional) - Russian translation
- `title_en` (String, max_length=200, optional) - English translation
- `description` (Text, required)
- `description_ru` (Text, optional) - Russian translation
- `description_en` (Text, optional) - English translation
- `category` (ChoiceField: 'web-dev', 'marketing', 'pet-project', required)
- `tags` (ArrayField or ManyToMany, optional) - Technologies used
- `featured_image` (ImageField, optional) - Main project image
- `demo_url` (URLField, optional) - Link to live demo
- `github_url` (URLField, optional) - Link to GitHub repository
- `created_date` (DateTimeField, auto_now_add)
- `updated_date` (DateTimeField, auto_now)
- `is_featured` (BooleanField, default=False) - For highlighting projects
- `order` (IntegerField, default=0) - For manual sorting

### Validation Rules

- `title` must not be empty
- `description` must not be empty
- `category` must be one of: 'web-dev', 'marketing', 'pet-project'
- `demo_url` and `github_url` must be valid URLs if provided
- `featured_image` must be valid image format (jpg, png, webp)

### Relationships

- None (standalone entity)

### State Transitions

- Created → Published (via `is_featured` flag or admin action)
- Published → Archived (soft delete, not implemented in MVP)

### Indexes

- `category` - For filtering queries
- `created_date` - For sorting by date
- `is_featured` - For featured projects query

## Entity: ContactSubmission

**Purpose**: Represents a form submission from a potential client or employer.

### Attributes

- `id` (Integer, Primary Key, Auto-increment)
- `name` (String, max_length=100, required)
- `email` (EmailField, required)
- `phone` (String, max_length=20, optional)
- `message` (TextField, required)
- `consent_given` (BooleanField, required) - 152-ФЗ compliance
- `submitted_at` (DateTimeField, auto_now_add)
- `ip_address` (GenericIPAddressField, optional) - For analytics/spam prevention
- `status` (ChoiceField: 'new', 'read', 'replied', default='new') - For admin tracking

### Validation Rules

- `name` must not be empty, min_length=2
- `email` must be valid email format
- `message` must not be empty, min_length=10
- `consent_given` must be True (enforced in frontend, validated in backend)

### Relationships

- None (standalone entity)

### State Transitions

- New → Read (admin marks as read)
- Read → Replied (admin marks as replied)

### Indexes

- `submitted_at` - For sorting by date
- `status` - For filtering unread submissions
- `email` - For duplicate detection (optional)

## Entity: Service

**Purpose**: Represents a service offering (e.g., "Сайт под ключ", "Разработка на React/Python").

### Attributes

- `id` (Integer, Primary Key, Auto-increment)
- `name` (String, max_length=200, required)
- `name_ru` (String, max_length=200, optional) - Russian translation
- `name_en` (String, max_length=200, optional) - English translation
- `description` (Text, required)
- `description_ru` (Text, optional) - Russian translation
- `description_en` (Text, optional) - English translation
- `price` (DecimalField, optional) - Price in RUB
- `category` (ChoiceField: 'full-site', 'development', 'marketing', required)
- `is_featured` (BooleanField, default=False)
- `order` (IntegerField, default=0) - For manual sorting
- `created_date` (DateTimeField, auto_now_add)
- `updated_date` (DateTimeField, auto_now)

### Validation Rules

- `name` must not be empty
- `description` must not be empty
- `category` must be one of: 'full-site', 'development', 'marketing'
- `price` must be positive if provided

### Relationships

- None (standalone entity)

### Indexes

- `category` - For filtering by service type
- `is_featured` - For featured services query
- `order` - For sorting

## Database Schema Considerations

### Translation Fields

All translatable entities (Project, Service) use django-modeltranslation pattern:
- Base fields: `title`, `description`
- Translated fields: `title_ru`, `title_en`, `description_ru`, `description_en`
- Admin interface shows language tabs automatically

### Soft Deletes

Not implemented in MVP. Can be added later with `is_deleted` boolean field if needed.

### Timestamps

All entities include `created_date` and `updated_date` for audit trail and sorting.

### Image Storage

- `featured_image` stored in `media/projects/` directory
- Use Django's ImageField with Pillow for validation
- Consider cloud storage (S3) for production scaling

## API Response Format

### Project List Response

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Project Name",
      "description": "Project description...",
      "category": "web-dev",
      "tags": ["React", "Next.js"],
      "featured_image": "/media/projects/image.jpg",
      "demo_url": "https://demo.example.com",
      "github_url": "https://github.com/user/repo",
      "created_date": "2025-01-27T10:00:00Z"
    }
  ]
}
```

### Contact Submission Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+79001234567",
  "message": "I'm interested in your services...",
  "consent_given": true
}
```

### Contact Submission Response

```json
{
  "id": 1,
  "status": "success",
  "message": "Thank you for your submission!"
}
```

## Data Migration Strategy

1. Initial migration creates all tables
2. Seed data migration for initial projects and services (optional)
3. Future migrations for schema changes (add fields, indexes)

## Data Validation

### Frontend Validation (Zod)

- Client-side validation for immediate feedback
- Prevents invalid submissions
- Better UX

### Backend Validation (Django)

- Server-side validation as security layer
- Prevents API abuse
- Data integrity guarantee

Both validations must match to ensure consistency.

