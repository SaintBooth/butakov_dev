# Research: Featured Projects on Homepage

**Feature**: 003-featured-projects  
**Date**: 2025-12-12

## Research Summary

This feature requires minimal research as it extends existing infrastructure. All technical decisions are already made in the base project (001-fullstack-pwa-portfolio).

## Existing Infrastructure Verification

### 1. Backend API Filter

**Decision**: Use existing `/api/projects/?featured=true` endpoint

**Verification**:
```python
# backend/portfolio/views.py:24-26
featured = request.query_params.get('featured', None)
if featured == 'true':
    queryset = queryset.filter(is_featured=True)
```

**Rationale**: Endpoint already exists and is tested. No new backend code needed.

**Alternatives considered**:
- Creating dedicated `/api/featured-projects/` endpoint → Rejected (redundant, violates DRY)

### 2. Data Model Field

**Decision**: Use existing `is_featured` boolean field on Project model

**Verification**:
```python
# backend/portfolio/models.py:55,65
is_featured = models.BooleanField(default=False)
# ...
models.Index(fields=['is_featured']),
```

**Rationale**: Field exists with database index for query performance.

**Alternatives considered**:
- Adding `featured_order` field for manual sorting → Deferred (FR-011 specifies "most recently updated" order)

### 3. Image Lazy Loading

**Decision**: Use Next.js `Image` component with `loading="lazy"` (default behavior)

**Verification**:
```tsx
// frontend/components/portfolio/ProjectCard.tsx:52-58
<Image
  src={featured_image || PROJECT_CARD_PLACEHOLDER}
  alt={featured_image ? title : "Project placeholder"}
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-300"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Rationale**: ProjectCard already uses Next.js Image with proper `sizes` attribute. Lazy loading is default for images without `priority` prop.

**Alternatives considered**:
- Custom lazy loading implementation → Rejected (Next.js Image handles this optimally)

### 4. i18n Support

**Decision**: Use existing `lang` query parameter for API and `useLocale()` for frontend

**Verification**:
- API accepts `?lang=ru` / `?lang=en` parameters
- Frontend uses `next-intl` with `useLocale()` hook

**Rationale**: Consistent with existing implementation across Portfolio page.

### 5. Card Navigation

**Decision**: Reuse ProjectCard component which already links to `/projects/{slug}`

**Verification**:
```tsx
// frontend/components/portfolio/ProjectCard.tsx:50
<Link href={`/projects/${slug}` as never} locale={locale} className="block">
```

**Rationale**: Identical navigation behavior required (FR-006). Reusing component ensures consistency.

## Performance Considerations

### CLS Prevention (SC-008: CLS < 0.1)

**Strategy**:
1. Fixed aspect ratio container for images (existing in ProjectCard)
2. Skeleton loading state with same dimensions
3. `sizes` attribute for responsive images

### PageSpeed Optimization

**Strategy**:
1. Lazy loading for all images (below fold)
2. Limit to 6 projects (FR-003)
3. Reuse optimized ProjectCard component

## Conclusion

No new technical decisions required. Feature can be implemented using existing infrastructure:

| Component | Source | Action |
|-----------|--------|--------|
| API endpoint | views.py | Use as-is |
| Data model | models.py | Use as-is |
| Card component | ProjectCard.tsx | Reuse |
| Grid layout | BentoGrid.tsx | Reuse |
| API client | api.ts | Add `featured` param |
| Homepage | page.tsx | Replace static section |

**New code required**: ~50-100 lines (FeaturedProjects component + API helper)
