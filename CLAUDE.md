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

## 5. Общие правила кода

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
