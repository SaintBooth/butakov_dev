# API Contracts: Fullstack PWA Portfolio

**Feature**: 001-fullstack-pwa-portfolio  
**Date**: 2025-01-27

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.example.com` (to be configured)

## Authentication

All endpoints are public (no authentication required for MVP).

## Endpoints

### GET /api/projects/

Retrieve list of portfolio projects with optional filtering and pagination.

**Query Parameters**:
- `lang` (optional): Language code (`ru` or `en`). Defaults to `ru` if not specified.
- `category` (optional): Filter by category (`web-dev`, `marketing`, `pet-project`).
- `page` (optional): Page number for pagination (default: 1).
- `page_size` (optional): Items per page (default: 10, max: 100).

**Request Example**:
```
GET /api/projects/?lang=en&category=web-dev&page=1
```

**Response (200 OK)**:
```json
{
  "count": 15,
  "next": "http://api.example.com/api/projects/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "E-commerce Platform",
      "title_ru": "Платформа электронной коммерции",
      "title_en": "E-commerce Platform",
      "description": "Full-stack e-commerce solution...",
      "description_ru": "Полнофункциональное решение для электронной коммерции...",
      "description_en": "Full-stack e-commerce solution...",
      "category": "web-dev",
      "tags": ["React", "Next.js", "Django", "PostgreSQL"],
      "featured_image": "http://api.example.com/media/projects/ecommerce.jpg",
      "demo_url": "https://demo.example.com",
      "github_url": "https://github.com/user/repo",
      "is_featured": true,
      "created_date": "2025-01-15T10:00:00Z",
      "updated_date": "2025-01-20T15:30:00Z"
    }
  ]
}
```

**Response Fields**:
- `count`: Total number of projects matching filters
- `next`: URL to next page (null if last page)
- `previous`: URL to previous page (null if first page)
- `results`: Array of project objects

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

**Language Handling**:
- If `lang=en` is specified, response includes `title_en` and `description_en` fields
- If `lang=ru` is specified, response includes `title_ru` and `description_ru` fields
- Frontend should use appropriate language fields based on current locale

---

### POST /api/contact/

Submit a contact form with lead information.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+79001234567",
  "message": "I'm interested in your services. Can we schedule a call?",
  "consent_given": true
}
```

**Request Fields**:
- `name` (string, required): Contact name, min 2 characters, max 100 characters
- `email` (string, required): Valid email address
- `phone` (string, optional): Phone number, max 20 characters
- `message` (string, required): Message text, min 10 characters
- `consent_given` (boolean, required): Must be `true` for submission to succeed

**Response (201 Created)**:
```json
{
  "id": 1,
  "status": "success",
  "message": "Thank you for your submission! We'll get back to you soon."
}
```

**Response Fields**:
- `id`: Database ID of created submission
- `status`: Always "success" for successful submission
- `message`: Success message (translated based on Accept-Language header)

**Error Responses**:
- `400 Bad Request`: Validation errors
  ```json
  {
    "status": "error",
    "errors": {
      "name": ["This field is required."],
      "email": ["Enter a valid email address."],
      "consent_given": ["You must provide consent to submit this form."]
    }
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "status": "error",
    "message": "An error occurred. Please try again later."
  }
  ```

**Side Effects**:
- Creates ContactSubmission record in database
- Sends Telegram notification to configured bot
- Logs submission for admin review

**Validation Rules**:
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Optional, max 20 characters
- `message`: Required, min 10 characters
- `consent_given`: Required, must be `true`

---

### GET /api/services/

Retrieve list of service offerings (optional endpoint for services page).

**Query Parameters**:
- `lang` (optional): Language code (`ru` or `en`). Defaults to `ru`.
- `category` (optional): Filter by category (`full-site`, `development`, `marketing`).

**Request Example**:
```
GET /api/services/?lang=en
```

**Response (200 OK)**:
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Full Site Development",
      "name_ru": "Сайт под ключ",
      "name_en": "Full Site Development",
      "description": "Complete website development...",
      "description_ru": "Разработка сайта под ключ...",
      "description_en": "Complete website development...",
      "price": "50000.00",
      "category": "full-site",
      "is_featured": true,
      "created_date": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

## CORS Configuration

**Allowed Origins**:
- Development: `http://localhost:3000`
- Production: Frontend domain (to be configured)

**Allowed Methods**: GET, POST, OPTIONS

**Allowed Headers**: Content-Type, Accept-Language

## Rate Limiting

**Contact Form Endpoint**:
- Limit: 5 submissions per IP per hour
- Response: `429 Too Many Requests` if exceeded

**Projects Endpoint**:
- No rate limiting (public read-only data)

## Content-Type

All requests and responses use `application/json`.

## Error Response Format

All errors follow this format:
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

## Versioning

API versioning not implemented in MVP. Future versions can use URL versioning (`/api/v1/`) or header versioning.

