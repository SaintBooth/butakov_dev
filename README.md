# butakov.dev

Персональный сайт **Александра Бутакова** — независимого IT-консультанта и разработчика веб-приложений для B2B.

🌐 **[butakov.dev](https://butakov.dev)** · 📩 hello@butakov.dev · 💬 [Telegram](https://t.me/SashaBooth)

---

## Чем занимаюсь

- Разработка сложных веб-сервисов и SaaS на **Django + Next.js**
- Интернет-магазины на **1С-Битрикс** с интеграцией 1С:УТ
- **Digital-маркетинг и Яндекс Директ** — сквозная аналитика, воронки, KPI
- Корпоративные сайты на **WordPress**
- **ИИ-консалтинг** — внедрение LLM и нейросетей в бизнес-процессы

Работаю официально: договор, NDA, ЭДО. Гарантия 6 месяцев.

---

## Архитектура проекта

Сайт построен по корпоративным стандартам разработки 2026 года.

**Стек:** React 19, Vite 8, Tailwind CSS v4, Zod, clsx

**Принципы:**

- **Feature-Sliced Design** — код разбит по бизнес-фичам, а не по типам файлов
- **BEM-компоненты** — изолированные блоки без внешних зависимостей
- **Zod-валидация** — все данные форм и ответы внешних API проверяются схемами
- **Conventional Commits** — атомарные коммиты с автоматической валидацией через commitlint
- **Git Hooks** — pre-commit: ESLint + Prettier, commit-msg: commitlint

**SEO и производительность:**

- Schema.org JSON-LD: `ProfessionalService`, `Person`, `FAQPage`, `hasOfferCatalog`
- Полный NAP для LocalBusiness, `sameAs` для Knowledge Graph
- Conversational H2/H3 под голосовой и ИИ-поиск
- Локальный шрифт Geist (woff2) с `font-display: swap` и `<link rel="preload">` — без Google Fonts
- Изображения в WebP + AVIF через `<picture>` (−58% к размеру vs PNG)
- Lazy-загрузка модальных окон (`React.lazy`) — меньше JS при старте
- `fetchpriority="high"` на LCP-элементе

---

## Собственные проекты

### [PromptSpace.ru](https://promptspace.ru)

Маркетплейс монетизации AI-промптов. Спроектирован и запущен с нуля.

**Стек:** Next.js 15 SSR · Django Ninja REST · PostgreSQL + pgvector · HashiCorp Vault

Реализовано: семантический поиск, Envelope-шифрование (152-ФЗ), автоматическое расщепление платежей между платформой и авторами.

---

## Реквизиты

**ИП Бутаков Александр Сергеевич**  
ИНН: 667011271708 · ОГРНИП: 326965800043687
