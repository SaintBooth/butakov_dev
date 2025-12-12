# Data Model: Featured Projects

**Feature**: 003-featured-projects  
**Date**: 2025-12-12

## Overview

This feature uses the **existing** Project model. No database migrations required.

## Entity: Project (Existing)

```python
# backend/portfolio/models.py

class Project(models.Model):
    """Represents a portfolio project/work item."""
    
    # Core fields
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    
    # Translation fields (via django-modeltranslation pattern)
    title_ru = models.CharField(max_length=200, blank=True, null=True)
    title_en = models.CharField(max_length=200, blank=True, null=True)
    description_ru = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    
    # Media
    featured_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    demo_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    
    # Tags
    tags = models.JSONField(default=list, blank=True)
    
    # Featured flag (USED BY THIS FEATURE)
    is_featured = models.BooleanField(default=False)  # ← Key field
    
    # Ordering
    order = models.IntegerField(default=0)
    
    # Timestamps
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)  # ← Used for ordering
    
    class Meta:
        ordering = ['order', '-created_date']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['created_date']),
            models.Index(fields=['is_featured']),  # ← Index exists
        ]
```

## Field Usage for This Feature

| Field | Usage | Notes |
|-------|-------|-------|
| `is_featured` | Filter projects | Boolean, default=false |
| `updated_date` | Sort order | FR-011: "most recently updated" |
| `title` / `title_{locale}` | Display | i18n support |
| `description` / `description_{locale}` | Display | i18n support |
| `featured_image` | Card thumbnail | Lazy loaded |
| `category` | Category badge | Display on card |
| `tags` | Tech stack | Display on card |
| `slug` | Navigation | Link to project details |
| `demo_url` | Demo button | Optional |
| `github_url` | GitHub button | Optional |

## Query Pattern

```python
# Featured projects query (already implemented in views.py)
Project.objects.filter(is_featured=True).order_by('-updated_date')[:6]
```

**Note**: Current API ordering uses `['order', '-created_date']` from Meta. 
For FR-011 compliance, the API should order by `-updated_date` when `featured=true`.

## Validation Rules

| Rule | Implementation |
|------|---------------|
| Max 6 displayed | Frontend limit (API returns all featured) |
| Hide when empty | Frontend conditional render |
| No broken images | Placeholder fallback in ProjectCard |

## State Transitions

```
[Project Created] → is_featured=false
        ↓
[Admin toggles Featured checkbox]
        ↓
[is_featured=true] → Appears on homepage
        ↓
[Admin untoggles Featured checkbox]
        ↓
[is_featured=false] → Removed from homepage
```

## No Migrations Required

The `is_featured` field and its index already exist in the database schema.
