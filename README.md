# butakov.dev

Личный сайт-лендинг ИП Бутакова Александра — технического партнёра для B2B.

## Стек

- React 19 + Vite 8
- Tailwind CSS v4
- Zod (валидация форм)
- clsx (условные классы)
- Web3Forms (отправка заявок)
- Яндекс Метрика
- vite-imagetools (WebP/AVIF)

## Архитектура

```
src/
├── features/      # бизнес-фичи (contact, cases, blog)
├── sections/      # секции страницы
├── components/ui/ # атомарные UI-компоненты (Modal, Slider, LogoImage, ContentImage)
├── data/          # статические данные
├── config/        # конфиги (social links)
└── utils/         # утилиты
```

## Команды

```bash
npm run dev      # dev-сервер
npm run build    # production-сборка
npm run preview  # preview сборки
npm run lint     # ESLint
npm run images   # конвертация public/*.png → WebP + AVIF
```

## Деплой

```bash
bash ../deploy.sh   # build + rsync на сервер
```

SSH alias: `butakov` → `c500811@h65.netangels.ru`

## Переменные окружения

Скопируй `.env.example` → `.env` и заполни:

```
VITE_WEB3FORMS_KEY=your_key_here
```

## Git

Conventional Commits + Trunk-Based Development. Хуки (husky):

- `pre-commit` → lint-staged (ESLint + Prettier)
- `commit-msg` → commitlint (Conventional Commits)
