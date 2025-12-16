# Quick Reference: Homepage Architecture
## Визуальная схема решений

---

## 🎯 Hybrid Approach Matrix

| Секция | Визуальный стиль | Контент-фокус | Rationale |
|--------|-----------------|---------------|-----------|
| **Hero** | Tech-Heavy (glassmorphism, terminal) | Business (results-focused text) | Техническое доверие + бизнес-язык |
| **Stack** | Tech-Heavy (glassmorphism badges) | Hybrid (категории + tooltips) | Уникальность + понятность |
| **Services Card 1** | Tech-Heavy (code preview) | Technical | Демонстрация экспертности |
| **Services Card 2** | Biz-Focused (charts) | Business | Понятность для маркетологов |
| **Services Card 3** | Hybrid (circular + breakdown) | Both | Баланс визуала и информации |
| **Services Card 4** | Biz-Focused (clean text) | Business | Философия должна быть понятна |
| **Projects** | Tech-Heavy (glassmorphism) | Hybrid (tech + metrics) | Уникальность + доказательства |
| **CTA/Form** | Tech-Heavy (glassmorphism) | Biz-Focused (trust indicators) | Визуал + конверсия |

---

## 🎨 Visual Progression

```
┌─────────────────────────────────────────────────────────┐
│  HERO: Dark gradient + Aurora effects                   │
│  → Technical signals (code) + Business message          │
├─────────────────────────────────────────────────────────┤
│  STACK: Glassmorphism marquee                           │
│  → Technologies with categories                         │
├─────────────────────────────────────────────────────────┤
│  SERVICES: Bento grid (mix of styles)                   │
│  → Code (tech) → Charts (biz) → Hybrid → Text (biz)    │
├─────────────────────────────────────────────────────────┤
│  PROJECTS: Glassmorphism cards                          │
│  → Visual tech + Business metrics                       │
├─────────────────────────────────────────────────────────┤
│  CTA: Glassmorphism form                                │
│  → Technical aesthetic + Business trust                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 Key Animations Checklist

- [ ] **Hero:** Aurora background rotation (20s), typewriter code lines, pulse on stats
- [ ] **Stack:** Infinite marquee, pause on hover, hover glow effect
- [ ] **Services:** Staggered card appearance (0.1s delay), hover lift, chart animations
- [ ] **Projects:** Lazy load images, hover scale + glow, parallax on scroll
- [ ] **CTA:** Input focus glow, submit button pulse, success animation

---

## 📊 Engagement Optimization

### Scroll Behavior
- Hero becomes sticky on scroll (scale 0.98)
- Sections fade in with intersection observer
- Staggered animations (cascade effect)

### Micro-interactions
- All hover states: 200-300ms transitions
- Buttons: scale + glow
- Cards: lift + shadow
- Links: underline + color change

### Performance
- Lazy load non-critical images
- Use `transform` and `opacity` for animations (GPU)
- Preload hero resources
- Optimize font loading

---

## 🔄 A/B Testing Opportunities

1. **Hero H1:** Tech-focused vs Business-focused wording
2. **Services:** Code preview vs Icon grid for Card 1
3. **Projects:** Tech metrics vs Business metrics prominence
4. **CTA:** Glassmorphism vs Clean form design

---

## ✅ Implementation Checklist

### Phase 1: Core
- [ ] Update Hero section (Delivery Signals + new text)
- [ ] Enhance Stack marquee (categories + tooltips)
- [ ] Refine Services cards (hybrid approach)

### Phase 2: Content
- [ ] Add Featured Projects metrics
- [ ] Improve CTA section (trust indicators)
- [ ] Add animations

### Phase 3: Polish
- [ ] Performance audit
- [ ] Accessibility check
- [ ] Cross-browser testing
- [ ] Analytics setup

---

*См. полный документ: `homepage-architecture.md`*