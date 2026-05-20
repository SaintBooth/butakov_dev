# Style Guide: butakov.dev

## 1. UI-компоненты — BEM-философия

- Каждый компонент — независимый **Блок**. Отвечает только за внутренний вид.
- **Запрещено** добавлять внешние отступы (`margin`, `top`, `left`) на корневом элементе компонента. Позиционирование — задача родителя.
- Стилизация через **Tailwind CSS**.
- Модификаторы состояний через пропсы + **`clsx`** или **`cva`** (Class Variance Authority). Не через условные классы в строках.
- Структура папки компонента: `components/ui/Button/Button.jsx` (+ `Button.stories.jsx` если есть).

```jsx
// ✅ Правильно: компонент не знает где он стоит
export function Card({ variant = 'default', className, children }) {
  return <div className={cn(cardVariants({ variant }), className)}>{children}</div>;
}

// ❌ Неправильно: внешний margin на корне
export function Card() {
  return <div className="mt-8 mb-4 ...">...</div>;
}
```

## 2. Архитектура — Feature-Sliced Design

Группировка по **бизнес-фичам**, не по типу файла.

```
src/
├── features/
│   ├── contact/          # форма заявки
│   │   ├── Contact.jsx
│   │   ├── contactSchema.js   # zod-схема
│   │   └── useContactForm.js
│   ├── cases/            # портфолио кейсов
│   └── blog/
├── components/
│   └── ui/               # переиспользуемые атомарные UI
│       ├── Button/
│       ├── Modal/
│       └── Slider/
├── data/                 # статические данные (контент)
├── config/               # конфиги (social, seo и т.д.)
└── utils/                # чистые утилиты без side-effects
```

## 3. Управление состоянием

- **Состояние живет там, где оно нужно**: форма — в форме, модалка — в модалке.
- Глобальный стейт (Zustand/Redux) — только если одни данные нужны 3+ несвязанным компонентам.
- Подъем состояния вверх — через пропсы, не через глобальный стор.
- Для серверных данных (fetch) — React Query или SWR, не ручной `useState + useEffect`.

## 4. Валидация — Zod обязателен

- **Все данные из форм** перед отправкой валидируются через zod-схему.
- **Все ответы от внешних API** (Web3Forms, любые third-party) валидируются через zod.
- Схема живет рядом с фичей: `features/contact/contactSchema.js`.

```js
// features/contact/contactSchema.js
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
- Разметка живет в `index.html` (статически, видна краулерам до JS) — **не** в `useEffect`.
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
- `sameAs` — ссылки на соцсети (заполнить `src/config/social.js`)

## 6. Core Web Vitals — PageSpeed Green Zone (90-100)

### LCP < 2.5s

- Шрифты: **локальные woff2** + `font-display: swap` + `<link rel="preload">`. Запрещена загрузка с Google Fonts в runtime.
- LCP-изображение (логотип, hero): `fetchpriority="high"`, без `loading="lazy"`.
- Hero-секция: контент первого экрана — без отложенного рендера.

### INP < 200ms

- **Динамические импорты** (`lazy()` + `Suspense`) для всего, что не видно на первом экране: модалки, тяжёлые слайдеры, чаты.
- Тяжёлые вычисления → `requestIdleCallback()` или серверные Server Actions.
- JS bundle: не импортировать в основной chunk то, что нужно только при взаимодействии.

### CLS < 0.1

- Все `<img>`, `<video>`, `<iframe>` — обязательны `width` + `height` или `aspect-ratio`.
- Динамический контент резервирует фиксированное место (skeleton-размер = финальный блок).

### Изображения — автоматически через vite-imagetools

**Логотип/статика** (`public/`) — конвертируется вручную: `npm run images` → WebP + AVIF → `<LogoImage>`.

**Контентные изображения** (`src/assets/`) — автоматически через `vite-imagetools` + `<ContentImage>`:

```jsx
// 1. Импортируй из src/assets/ с query-параметрами vite-imagetools
import heroWebp from '../assets/hero.jpg?w=400;800;1200&format=webp&as=srcset';
import heroAvif from '../assets/hero.jpg?w=400;800;1200&format=avif&as=srcset';
import heroFallback from '../assets/hero.jpg';

// 2. Используй ContentImage — автоматически генерирует <picture> с srcset
<ContentImage
  src={heroFallback}
  srcWebp={heroWebp}
  srcAvif={heroAvif}
  alt="Описание"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
  priority // ← добавь для LCP-изображения первого экрана
/>;
```

Vite сгенерирует все размеры и форматы при сборке. PNG/JPG — только fallback.
Tailwind purge работает автоматически через Vite + Tailwind v4. Инлайн-CSS библиотеки запрещены.

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
- Проект использует JS (не TS), поэтому `tsc --noEmit` не применяется до миграции на TypeScript.

## 8. Общие правила кода

- **Нет хардкода**: URL, ключи, ID — в `config/` или `.env`.
- **Нет комментариев "что делает"**: код должен читаться сам. Комментарий — только "почему" (неочевидный инвариант, обход бага).
- **Нет преждевременных абстракций**: три похожих блока — ок. Абстракция нужна когда 4+ с общей логикой.
- **Размер компонента**: если > 150 строк JSX — разбить.

## Текущий стек

- React 19 + Vite 8
- Tailwind CSS v4
- Lucide React (иконки)
- Web3Forms (отправка формы) — ключ в `VITE_WEB3FORMS_KEY`
- Яндекс Метрика ID: 107722106
- Хостинг: Netangels, SSH alias `butakov`, деплой: `bash deploy.sh`

## Адаптация правил к текущему стеку (Vite SPA, не Next.js)

- **Server-First** → здесь нет SSR. Данные статические (захардкожены в `src/data/`). При переходе на Next.js — вынести в Server Components.
- **Drizzle ORM** → нет БД в этом проекте. Актуально для будущего backend.
- **End-to-End Type Safety** → сейчас JS, не TS. При добавлении TypeScript — типизировать data-файлы.
