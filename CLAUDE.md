# Style Guide: butakov.dev

## 1. UI-компоненты — BEM-философия

- Каждый компонент — независимый **Блок**. Отвечает только за внутренний вид.
- **Запрещено** добавлять внешние отступы (`margin`, `top`, `left`) на корневом элементе компонента. Позиционирование — задача родителя.
- Стилизация через **Tailwind CSS**.
- Модификаторы состояний через пропсы + **`clsx`** или **`cva`** (Class Variance Authority). Не через условные классы в строках.
- Структура папки компонента: `components/ui/Button/Button.tsx` (+ `Button.stories.tsx` если есть).

```tsx
// ✅ Правильно: компонент не знает где он стоит
export function Card({ variant = 'default', className, children }) {
  return <div className={cn(cardVariants({ variant }), className)}>{children}</div>;
}

// ❌ Неправильно: внешний margin на корне
export function Card() {
  return <div className="mt-8 mb-4 ...">...</div>;
}
```

## 2. Архитектура — Feature-Sliced Design + App Router

Роутинг — Next.js App Router (`src/app/`), бизнес-логика — по фичам, не по типу файла.

```
src/
├── app/
│   └── [locale]/          # next-intl: en/ru
│       ├── layout.tsx     # общий chrome (Header/Footer/MobileNav), metadata, schema.org
│       ├── page.tsx       # главная
│       └── journal/       # инженерный журнал (MDX-кейсы)
│           ├── page.tsx
│           └── [slug]/page.tsx
├── features/
│   ├── contact/           # форма заявки
│   │   ├── Contact.tsx
│   │   ├── contactSchema.ts   # zod-схема
│   │   └── useContactForm.ts
│   └── cases/              # портфолио кейсов на главной
├── sections/                # секции главной страницы (Hero, Services, Footer...)
├── components/
│   ├── ui/                 # переиспользуемые атомарные UI (Button, Modal, Slider...)
│   └── mdx/                 # компоненты для журнала (CodeBlock, CopyButton, Alert)
├── content/cases/{en,ru}/*.mdx  # кейсы журнала
├── data/                    # статические данные (контент)
├── config/                   # конфиги (social, schema и т.д.)
├── i18n/                     # next-intl navigation/request конфиг
└── utils/                    # чистые утилиты без side-effects
```

## 3. Управление состоянием

- **Состояние живет там, где оно нужно**: форма — в форме, модалка — в модалке.
- Глобальный стейт (Zustand/Redux) — только если одни данные нужны 3+ несвязанным компонентам.
- Подъем состояния вверх — через пропсы, не через глобальный стор.
- Для серверных данных (fetch) — React Query или SWR, не ручной `useState + useEffect`.

## 4. Валидация — Zod обязателен

- **Все данные из форм** перед отправкой валидируются через zod-схему.
- **Все ответы от внешних API** (Web3Forms, любые third-party) валидируются через zod.
- Схема живет рядом с фичей: `features/contact/contactSchema.ts`.

```ts
// features/contact/contactSchema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Введите имя'),
  contact: z.string().min(3, 'Введите Telegram или телефон'),
  service: z.string().optional(),
  message: z.string().optional(),
});
```

## 5. GEO & AI Search SEO (2026-стандарт)

### Schema.org JSON-LD

- Каждая страница/секция с уникальным контентом — валидная JSON-LD разметка соответствующего типа (`ProfessionalService`, `FAQPage`, `Article`, `Service`).
- Разметка живет в `src/config/schema.ts` и рендерится в `[locale]/layout.tsx` как `<script type="application/ld+json">` в серверном компоненте (видна краулерам до гидрации) — **не** в `useEffect`.
- Минимальный набор для текущего сайта: `ProfessionalService` + `FAQPage` + `hasOfferCatalog`.
- NAP (Name, Address, Phone) — обязательны для `LocalBusiness`. Гео-координаты (`geo`) — при наличии физического адреса.

```json
// Структура ProfessionalService для butakov.dev
{
  "@type": ["ProfessionalService", "LocalBusiness"],
  "name": "ИП Бутаков Александр Сергеевич",
  "areaServed": { "@type": "Country", "name": "Russia" },
  "hasOfferCatalog": { "@type": "OfferCatalog", "itemListElement": [...] }
}
```

### Структура контента для ИИ-сборщиков

- Каждый ключевой раздел начинается с **Direct Answer** ≤ 50 слов: прямой ответ на вопрос, который пользователь мог бы задать голосом.
- Используй списки (`ul/ol`) и таблицы для перечислений — не сплошной текст.
- H2/H3 — вопросительный или конверсационный стиль:
  - ✅ `«Почему выбирают меня, а не студию?»`
  - ✅ `«Как начать сотрудничество?»`
  - ❌ `«О нас»`, `«Наши преимущества»`

### FAQPage

- Блок B2B-гарантий и блок процесса → дублировать как `FAQPage` в JSON-LD.
- Вопросы формулировать под голосовой поиск: полные предложения, не обрывки.

### Что требует данных от клиента (TODO)

- `telephone` — номер телефона для NAP
- `geo` — координаты (lat/lon) если есть физический офис
- `sameAs` — ссылки на соцсети (заполнить `src/config/social.ts`)

## 6. Core Web Vitals — PageSpeed Green Zone (90-100)

### LCP < 2.5s

- Шрифты: **`next/font`** (Geist через `next/font/google` или локальный woff2), автоматический `font-display: swap` и preload. Запрещена загрузка шрифтов вручную через `<link>` в рантайме.
- LCP-изображение (логотип, hero): `priority` на `<Image>`, без `loading="lazy"`.
- Hero-секция и весь контент первого экрана рендерятся на сервере (RSC) — без клиентского отложенного рендера.

### INP < 200ms

- Интерактивные куски — **client components** (`'use client'`) минимального размера, обёрнутые в `Suspense` там, где это уместно.
- Модалки, тяжёлые слайдеры, чаты — через `next/dynamic` с `ssr: false`, если им не нужен SSR.
- Тяжёлые вычисления → серверные компоненты/Server Actions, а не клиентский JS.

### CLS < 0.1

- Все `<Image>` — обязательны `width` + `height` (или `fill` + `aspect-ratio` на контейнере).
- Динамический контент резервирует фиксированное место (skeleton-размер = финальный блок).

### Изображения — через `next/image`

**Логотип/статика** (`public/`) → `<LogoImage>` (`src/components/ui/LogoImage`), оптимизация вручную через `npm run images` (WebP/AVIF).

**Контентные изображения** — через `<ContentImage>` (`src/components/ui/ContentImage`), тонкая обёртка над `next/image`. Next.js сам генерирует WebP/AVIF и `srcset` при сборке — ручных query-параметров и импортов из `assets/` не нужно:

```tsx
<ContentImage
  src="/images/hero.jpg"
  alt="Описание"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
  priority // ← для LCP-изображения первого экрана
/>
```

Tailwind purge работает автоматически через Tailwind v4 (`@tailwindcss/postcss`). Инлайн-CSS библиотеки запрещены.

## 7. Git — Trunk-Based Development + Conventional Commits

### Стратегия ветвления

- `main` — всегда stable, production-ready. Прямые коммиты только в экстренных случаях.
- Фичи — короткоживущие ветки (≤2 дня), шаблон: `feat/TASK-123-short-desc`, `fix/BUG-404-cart-loop`
- Разрешённые типы: `feat/`, `fix/`, `docs/`, `style/`, `refactor/`, `perf/`, `chore/`

### Conventional Commits v1.0.0

```
<type>(<scope>): <description>   ← строчные, без точки, ≤50 символов
```

| type       | когда                               |
| ---------- | ----------------------------------- |
| `feat`     | новый функционал                    |
| `fix`      | исправление бага                    |
| `refactor` | рефакторинг без изменения поведения |
| `perf`     | оптимизация производительности      |
| `style`    | форматирование, пробелы (не логика) |
| `docs`     | только документация                 |
| `chore`    | зависимости, конфиг сборки          |
| `test`     | тесты                               |

Примеры: `feat(contact): add zod validation`, `perf(images): webp/avif with picture element`

### Git Hooks (автоматически)

- **pre-commit**: `lint-staged` → eslint --fix + prettier --write на staged-файлах
- **commit-msg**: `commitlint` → валидация формата Conventional Commits
- CI (`.github/workflows/deploy.yml`) на каждый push/PR в `main` гоняет `tsc --noEmit` и `next lint` перед деплоем.

## 8. Общие правила кода

- **Нет хардкода**: URL, ключи, ID — в `config/` или `.env`.
- **Нет комментариев "что делает"**: код должен читаться сам. Комментарий — только "почему" (неочевидный инвариант, обход бага).
- **Нет преждевременных абстракций**: три похожих блока — ок. Абстракция нужна когда 4+ с общей логикой.
- **Размер компонента**: если > 150 строк JSX — разбить.

## Текущий стек

- Next.js 15 (App Router, RSC) + React 19 + TypeScript (strict)
- next-intl — i18n (en/ru, `localePrefix: 'as-needed'`)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- next-mdx-remote + shiki — инженерный журнал (`content/cases/{en,ru}/*.mdx`), код-блоки в стиле Хабра
- Lucide React (иконки)
- Web3Forms (отправка формы) — ключ в `NEXT_PUBLIC_WEB3FORMS_KEY`
- Яндекс Метрика ID: 107722106
- Хостинг прод: Netangels (Node.js-сайт, PM/Passenger-подобный супервизор), SSH alias `butakov`
- Деплой: push в `main` → GitHub Actions (`.github/workflows/deploy.yml`) собирает Next.js standalone-бандл и выкладывает на прод автоматически. Никаких ручных `deploy.sh`/`rsync`.

## Архитектура и данные

- **Server-First на месте.** Секции — server components по умолчанию; интерактив выносится в отдельные клиентские компоненты (`'use client'`).
- **Инженерный журнал** — MDX-кейсы, frontmatter валидируется zod-схемой в `src/utils/cases.ts` (title/date/tags/metric/excerpt). Список сортируется по дате (новые сверху). Публикация кейса = обычный commit с новым `.mdx`, деплоится автодеплоем.
- **Drizzle ORM** → БД в проекте нет. Актуально для будущего backend.
- **End-to-End Type Safety** → выполнено: проект на TypeScript strict, data-файлы (`src/data/*.ts`) типизированы.
