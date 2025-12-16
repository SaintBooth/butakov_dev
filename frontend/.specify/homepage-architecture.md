# Архитектура главной страницы butakov.dev
## "От кода до конверсии"

---

## 1. Narrative Arc Analysis

### Концепция связи Code ↔ Conversion

**Визуальная метафора:** Путешествие по вертикальной оси от абстракций (код, архитектура) к конкретным результатам (метрики, ROI). Каждая секция создает "мост" между техническим и бизнес-языком.

**Структура повествования:**

```
[Hero] Техническое совершенство как основа
    ↓
[Stack] Инструменты = средство достижения цели
    ↓
[Services] Процесс трансформации (Code → Conversion)
    ↓
[Projects] Доказательства через результаты
    ↓
[CTA] Призыв к действию на основе доверия
```

**Визуальные связи:**
- **Цветовая прогрессия:** Темные тона (code) → Неоновые акценты (transformation) → Светлые карточки (results)
- **Типографика:** Моноширинный шрифт (code) → Градиенты (bridge) → Чистые заголовки (business)
- **Анимации:** Статические элементы (stability) → Динамические индикаторы (growth) → Минималистичные переходы (trust)

---

## 2. Section-by-Section Structure

### Секция 1: Hero (Hero Section)

#### UX Goal
За 3 секунды ответить: "Кто ты?" + "Что ты делаешь?" + "Почему мне это нужно?". Создать доверие через демонстрацию технической экспертизы И понимания бизнес-целей.

#### Контент & Keywords

**RU Version:**
- **Badge:** "Fullstack-разработка · PWA · Performance Marketing"
- **H1:** "От кода до конверсии: создаю цифровые продукты, которые работают."
- **Subtitle:** "Fullstack-разработчик и перформанс-маркетолог. Превращаю техническое совершенство в измеримый бизнес-результат."
- **CTA Primary:** "Посмотреть работы"
- **CTA Secondary:** "GitHub"

**Keywords:** Performance, Measurable results, Code quality, Business impact, Technical excellence, ROI

#### Visual Concept A: Tech-Heavy

**Левая часть (Content):**
- Фон: Градиент `from-slate-900 via-slate-800 to-slate-900` с Aurora-эффектами (blur-3xl круги primary/sky)
- Badge: Glassmorphism с иконкой Sparkles, border `white/10`, backdrop-blur
- H1: Gradient text `from-white via-white to-primary` с subtle glow на hover
- Subtitle: `text-white/80` с плавным fade-in при scroll
- CTA: Primary кнопка с `shadow-[0_10px_40px_-18px_rgba(15,212,200,0.8)]`

**Правая часть (Delivery Signals):**
- Glassmorphism card с terminal-эстетикой
- Live metrics grid (Lighthouse 100, SEO A+, Uptime 99.9%) с pulse animation на значениях
- Code block simulation:
  ```tsx
  // build.ts terminal window
  › pnpm lint && pnpm test
  Deploying to edge...
  Perf budget: OK
  ```
- Typewriter effect для строк кода (появляются последовательно)
- Subtle cursor blink animation

**Микро-анимации:**
- Aurora backgrounds: медленное вращение (rotate-45 animate-spin, duration 20s)
- Stats: pulse на hover
- Code lines: появляются с delay 0.3s каждая

#### Visual Concept B: Biz-Focused

**Левая часть (Content):**
- Фон: Более светлый gradient `from-slate-50 via-white to-slate-50` в light mode, subtle grid pattern overlay
- Badge: Плоский badge с solid background `bg-primary/10`, без blur
- H1: Solid color `text-foreground`, акцент только на ключевых словах через gradient
- Subtitle: Более контрастный `text-muted-foreground`
- CTA: Более крупные кнопки, больше white space

**Правая часть (Business Metrics):**
- Clean card без glassmorphism, solid background
- Метрики представлены как инфографика:
  - Lighthouse 100: Circular progress indicator (100% заполнен)
  - SEO A+: Badge с checkmark icon
  - Uptime 99.9%: Line chart миниатюра с upward trend
- График роста вместо code block:
  - Mini line chart с анимацией роста (от 0 до целевого значения за 1.5s)
  - Цвет: gradient от primary/40 до primary
  - Подпись: "Performance trend ↑"

**Микро-анимации:**
- Chart рост: плавная анимация от baseline
- Метрики: counter animation (0 → target value)
- Subtle bounce на hover для карточек

#### UX/UI Micro-tip
**Hybrid Approach:** Использовать Tech-Heavy для delivery signals (левая часть остается нейтральной), но добавить counter animation для чисел. Это создает баланс: техническое доверие + понятность для бизнес-аудитории.

**Scroll behavior:** При скролле вниз, hero section слегка уменьшается (scale 0.98) и становится sticky на 100vh, создавая эффект "закрепления" важной информации.

---

### Секция 2: Stack (Technology Stack)

#### UX Goal
Показать широту технологий без перегрузки. Создать впечатление "бесконечных возможностей" через горизонтальный marquee, но с возможностью остановки на hover для изучения.

#### Контент & Keywords

**RU Version:**
- **Title:** "«Бесконечный» стек"
- **Subtitle (опционально):** "От фронтенда до аналитики — полный цикл разработки"
- **Items:** Next.js, Django, Docker, Figma, Yandex.Metrika, PostgreSQL, TypeScript, Tailwind CSS, Redis, OpenAI API

**Keywords:** Fullstack, Modern stack, Scalable, Production-ready, Analytics integration

#### Visual Concept A: Tech-Heavy

**Marquee Container:**
- Dark background `bg-slate-900/50` с border `border-white/10`
- Backdrop-blur для depth
- Infinite scroll marquee с дублированием массива

**Tech Badges:**
- Glassmorphism: `bg-white/5`, `border-white/10`, backdrop-blur
- Моноширинный шрифт (font-mono) для части технологий (Next.js, Docker)
- Hover effect:
  - Border меняется на `border-primary/50`
  - Text color → `text-primary`
  - Scale: `scale-105`
  - Shadow: `shadow-[0_4px_20px_-10px_rgba(15,212,200,0.6)]`
- Pause on hover: `animation-play-state: paused`

**Дополнительные элементы:**
- Иконки технологий (опционально) справа от названия
- Индикатор scroll direction (стрелки left/right на краях)

#### Visual Concept B: Biz-Focused

**Marquee Container:**
- Light card background `bg-card`
- Четкие borders `border-gray-200`
- Более медленная анимация (24s вместо 18s) для лучшей читаемости

**Tech Badges:**
- Solid backgrounds с категориями:
  - Frontend: `bg-blue-50 dark:bg-blue-950/20`
  - Backend: `bg-green-50 dark:bg-green-950/20`
  - Tools: `bg-purple-50 dark:bg-purple-950/20`
- Чистая типографика (sans-serif)
- Hover: плавный lift `-translate-y-1` + shadow
- Badge может показывать краткое описание при hover (tooltip)

**Дополнительные элементы:**
- Разделители между категориями (опционально)
- Статистика: "15+ технологий в стеке" под marquee

#### UX/UI Micro-tip
**Hybrid Approach:** Использовать Tech-Heavy визуал (glassmorphism) с категориями из Biz-Focused. Добавить subtle gradient overlay на краях для hint о бесконечности. При hover на badge — показывать краткий tooltip с применением технологии (например, "Next.js: SSR, SEO, Performance").

**Accessibility:** Добавить pause/play button для пользователей, которым анимация мешает.

---

### Секция 3: Services (Bento Grid)

#### UX Goal
Показать процесс трансформации от кода к конверсии через 4 карточки. Каждая карточка — этап journey: Development → Marketing → Optimization → Philosophy.

#### Контент & Keywords

**RU Version:**

1. **Fullstack-разработка** (span 2)
   - Код пример: стек технологий и архитектура
   - Keywords: Clean code, Architecture, Scalability, TypeScript, PWA

2. **Перформанс-маркетинг** (span 1)
   - Визуализация роста: график/барчарт
   - Keywords: ROI, Conversion rate, Analytics, Campaigns, A/B testing

3. **Скорость и SEO** (span 1)
   - Performance score: Circular indicator 100
   - Keywords: Lighthouse, Core Web Vitals, SEO optimization, Page speed

4. **Моя философия** (span 2)
   - Текст о подходе: "Быстро запускаю, измеряю и итерирую. Объединяю продуктовое мышление с техническим исполнением."
   - Keywords: Iteration, Measurement, Product thinking, Fast delivery

#### Visual Concept A: Tech-Heavy

**Card 1 (Fullstack-разработка):**
- Terminal window simulation с syntax highlighting
- Code lines с typewriter effect (появляются последовательно)
- Цветовая схема терминала: dark background `bg-black/60`, green/cyan для syntax
- Cursor blink animation
- Subtle glow на границе терминала

**Card 2 (Перформанс-маркетинг):**
- Animated bar chart (bars растут от 0)
- Gradient bars: `from-primary/40 to-primary`
- Pulse animation на каждой bar с staggered delay
- Data labels появляются после анимации роста

**Card 3 (Скорость и SEO):**
- Circular progress indicator (концентрические круги)
- Внешний круг: `border-primary/30`
- Внутренний круг: `border-primary/70`
- Центр: число "100" с glow effect
- SVG animated path для smooth fill animation

**Card 4 (Философия):**
- Minimalist текст на glassmorphism background
- Key phrases выделены через gradient text
- Иконка Sparkles с subtle rotation animation

**Grid Layout:**
- Bento-style с разными размерами карточек
- Gap: `gap-4`
- Cards: `rounded-2xl`, `border-white/10`, `bg-card/80`

#### Visual Concept B: Biz-Focused

**Card 1 (Fullstack-разработка):**
- Иконки технологий в grid layout
- Краткие bullet points вместо кода:
  - "Frontend: React, Next.js, TypeScript"
  - "Backend: Django, PostgreSQL, Redis"
  - "Infrastructure: Docker, CI/CD"
- Clean icons с hover effects

**Card 2 (Перформанс-маркетинг):**
- Line chart с upward trend
- Real metrics display:
  - "ROI: +150%"
  - "Conversion: +45%"
  - "CPA: -30%"
- Chart анимируется от baseline

**Card 3 (Скорость и SEO):**
- Score breakdown в виде списка:
  - Performance: 100/100 ✓
  - Accessibility: 100/100 ✓
  - Best Practices: 100/100 ✓
  - SEO: 100/100 ✓
- Checkmarks с fade-in animation

**Card 4 (Философия):**
- Цитата в большом размере (quote style)
- Подпись: "— Мой подход к разработке"
- Minimalist design с focus на типографике

**Grid Layout:**
- Более структурированный grid с равномерными spacing
- Cards: solid backgrounds, четкие borders
- Hover: subtle lift + shadow

#### UX/UI Micro-tip
**Hybrid Approach:** Card 1 — Tech-Heavy (код создает техническое доверие). Card 2 — Biz-Focused (графики понятны бизнесу). Card 3 — Hybrid (circular progress + score breakdown). Card 4 — Biz-Focused (текст важнее визуала).

**Staggered animation:** Карточки появляются последовательно при scroll (intersection observer) с delay 0.1s каждая, создавая эффект "каскада".

---

### Секция 4: Featured Projects

#### UX Goal
Доказать экспертность через реальные результаты. Каждый проект должен демонстрировать связь Code → Conversion через метрики и технологии.

#### Контент & Keywords

**RU Version:**
- **Title:** "Избранные проекты"
- **Subtitle (опционально):** "От идеи до продакшена: каждый проект — это измеряемый результат"
- **Projects:** 3-6 проектов с:
  - Название
  - Краткое описание (1-2 предложения)
  - Категория (Web Development, Marketing, Fullstack)
  - Технологии (badges)
  - Метрики (Lighthouse score, Conversion rate, ROI)

**Keywords:** Case studies, Results, Metrics, Technologies, Impact, ROI

#### Visual Concept A: Tech-Heavy

**Project Cards:**
- Glassmorphism card с hover эффектом: scale + glow
- Image: Placeholder или screenshot с overlay gradient
- Code preview на hover (показывается фрагмент кода проекта)
- Terminal-style metrics в footer карточки:
  ```
  $ lighthouse --score 100
  $ conversion-rate 4.2%
  $ roi +180%
  ```

**Layout:**
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Cards: `rounded-2xl`, `border-white/10`
- Hover: `scale-105`, `shadow-lg`, border glow

**Дополнительно:**
- Badge с технологиями использует font-mono для части tech
- Hover показывает "View code" link с GitHub icon
- Parallax effect на images при scroll

#### Visual Concept B: Biz-Focused

**Project Cards:**
- Clean card design с prominent metrics section
- Metrics displayed as:
  - Large numbers (Lighthouse: **100**)
  - Percentage change (Conversion: **+45%**)
  - Trend indicators (↑ или ↓)
- Before/After сравнение (опционально):
  - "До: 2.1% conversion"
  - "После: 4.2% conversion"

**Layout:**
- Более структурированный grid
- Cards имеют четкие sections: Image | Content | Metrics
- Call-to-action: "Узнать больше" кнопка

**Дополнительно:**
- Category badges с цветовой кодировкой
- Client testimonial (1-2 предложения) под описанием
- Link to case study page

#### UX/UI Micro-tip
**Hybrid Approach:** Использовать Tech-Heavy визуал (glassmorphism) с Biz-Focused метриками (крупные числа, тренды). При hover показывать краткую метрику в терминальном стиле, но также отображать бизнес-метрики постоянно.

**Lazy loading:** Images загружаются с intersection observer, с placeholder skeleton.

---

### Секция 5: CTA / Contact Form

#### UX Goal
Превратить интерес в действие. Форма должна быть минималистичной, но с четким value proposition. Убрать friction, показать доверие (GDPR compliance, быстрая обратная связь).

#### Контент & Keywords

**RU Version:**
- **Title:** "Давайте поговорим"
- **Subtitle:** "Есть продукт для запуска или оптимизации? Давайте создадим решение, которое работает."
- **Form fields:**
  - Имя (required)
  - Email (required)
  - Телефон (optional)
  - Сообщение (required)
  - Consent checkbox (GDPR)

**Keywords:** Consultation, Free quote, Quick response, Trust, Privacy

#### Visual Concept A: Tech-Heavy

**Container:**
- Glassmorphism card с backdrop-blur
- Border: `border-white/10`
- Background: `bg-card/60`

**Form:**
- Inputs с glassmorphism style
- Focus state: border glow `border-primary/50`, `shadow-[0_0_20px_-10px_rgba(15,212,200,0.6)]`
- Placeholder: subtle `text-muted-foreground/50`
- Submit button: Primary с glow effect
- Loading state: Terminal spinner animation

**Дополнительно:**
- Real-time validation с terminal-style error messages
- Success state: анимированная checkmark с confetti (опционально)
- Privacy policy link: styled как code comment `// См. политику конфиденциальности`

#### Visual Concept B: Biz-Focused

**Container:**
- Clean white card (light mode) / dark card (dark mode)
- Solid background, четкие borders
- Больше white space

**Form:**
- Standard input design с четкими labels
- Focus: solid border `border-primary`
- Inline validation с friendly messages
- Submit button: крупный, prominent
- Loading: spinner или progress bar

**Дополнительно:**
- Trust indicators:
  - "Обычно отвечаю в течение 24 часов"
  - "Конфиденциально и безопасно"
- Privacy policy: четкая ссылка под формой
- Alternative contact methods (email, Telegram) рядом с формой

#### UX/UI Micro-tip
**Hybrid Approach:** Использовать Tech-Heavy визуал (glassmorphism container) с Biz-Focused UX (стандартные inputs, friendly validation). Trust indicators добавят уверенности бизнес-аудитории, а визуал сохранит техническую эстетику.

**Progressive enhancement:** Форма работает без JS (fallback на native form submission), но с JS добавляется AJAX отправка с лучшим UX.

---

## 3. Comparative Analysis

### Variant A (Tech-Heavy): Strengths & Weaknesses

**Strengths:**
- ✅ Сразу показывает техническую экспертизу
- ✅ Уникальный визуальный стиль (выделяется среди конкурентов)
- ✅ Привлекает разработчиков и технически подкованную аудиторию
- ✅ Создает впечатление инновационности

**Weaknesses:**
- ❌ Может отпугнуть не-техническую бизнес-аудиторию
- ❌ Code blocks могут быть непонятны маркетологам/бизнесу
- ❌ Risk of looking "too developer-focused"

**Best For:** Аудитория, которая ценит технические детали (CTOs, технические директора, разработчики, ищущие подрядчика).

---

### Variant B (Biz-Focused): Strengths & Weaknesses

**Strengths:**
- ✅ Понятен широкой бизнес-аудитории
- ✅ Метрики и графики говорят на языке ROI
- ✅ Профессиональный, но доступный дизайн
- ✅ Фокус на результатах, а не на процессе

**Weaknesses:**
- ❌ Может показаться "generic" (похож на другие сайты)
- ❌ Меньше демонстрации технической глубины
- ❌ Может не привлечь внимание разработчиков

**Best For:** Бизнес-аудитория (CEO, маркетологи, владельцы бизнеса), которая ищет результаты, а не технические детали.

---

### Hybrid "Best of Both Worlds" Approach

**Философия:** Использовать Tech-Heavy визуал для создания уникальности и технического доверия, но переводить контент на бизнес-язык там, где это важно для конверсии.

#### Конкретные решения:

1. **Hero Section:**
   - Tech-Heavy визуал (glassmorphism, terminal aesthetics)
   - Бизнес-ориентированный текст (фокус на результатах)
   - Delivery Signals: Tech-Heavy (Lighthouse, код), но с counter animation для понятности

2. **Stack Section:**
   - Tech-Heavy badges (glassmorphism, font-mono)
   - Добавить категории и tooltips с бизнес-применением технологий

3. **Services:**
   - Card 1 (Development): Tech-Heavy (код) — для технического доверия
   - Card 2 (Marketing): Biz-Focused (графики) — для бизнес-аудитории
   - Card 3 (SEO/Speed): Hybrid (circular + breakdown) — баланс
   - Card 4 (Philosophy): Biz-Focused (текст) — понятность

4. **Projects:**
   - Tech-Heavy визуал (glassmorphism cards)
   - Biz-Focused метрики (крупные числа, тренды)
   - Hover показывает технические детали для interested developers

5. **CTA/Form:**
   - Tech-Heavy визуал (glassmorphism)
   - Biz-Focused UX (стандартные inputs, trust indicators)

#### Engagement Optimization Tips:

1. **Scroll-triggered animations:** Использовать Intersection Observer для staggered animations при появлении секций

2. **Progressive disclosure:** Показывать базовую информацию, детали — на hover/click (например, code preview в projects)

3. **Micro-interactions:**
   - Hover states на всех интерактивных элементах
   - Smooth transitions (duration 200-300ms)
   - Feedback на всех actions (button clicks, form submissions)

4. **Performance:**
   - Lazy load images и тяжелые компоненты
   - Optimize animations (use `transform` and `opacity` for GPU acceleration)
   - Preload critical resources

5. **Accessibility:**
   - Pause animations option (respect `prefers-reduced-motion`)
   - Keyboard navigation support
   - ARIA labels для интерактивных элементов

---

## 4. Implementation Priority

### Phase 1: Core Structure (Week 1)
- [ ] Hero section с Delivery Signals (Hybrid approach)
- [ ] Stack marquee (Tech-Heavy визуал + категории)
- [ ] Services Bento grid (Hybrid: mix of A and B)

### Phase 2: Content & Polish (Week 2)
- [ ] Featured Projects с метриками (Hybrid)
- [ ] CTA/Form section (Hybrid)
- [ ] Animations и micro-interactions

### Phase 3: Optimization (Week 3)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] A/B testing setup для ключевых секций

---

## 5. Success Metrics

**Technical:**
- Lighthouse Performance: 100
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

**Business:**
- Conversion rate (form submissions): Target +30% vs current
- Time on page: > 2 minutes
- Bounce rate: < 40%
- Scroll depth: > 80% до CTA section

**UX:**
- Accessibility score: 100
- Mobile usability: No issues
- Cross-browser compatibility: Chrome, Firefox, Safari, Edge

---

*Документ создан: 2025-01-XX*  
*Версия: 1.0*