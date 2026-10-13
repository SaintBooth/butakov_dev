// Umami report/segment definitions synced by umami-reports.mjs. Names are the idempotency key.
// LANDING_RU mirrors LANDING_SLUGS[*].ru from src/config/landings.ts; reports.config.test.ts guards drift.
const LANDING_RU = {
  'web-dev': 'razrabotka-saytov',
  'web-apps': 'razrabotka-veb-prilozheniy',
  support: 'podderzhka-saytov',
  ai: 'vnedrenie-ii',
};
const FUNNEL_WINDOW_MIN = 60;

const ev = (value, filters) => ({ type: 'event', value, ...(filters && { filters }) });
const path = (value) => ({ type: 'path', value });
const eq = (property, value) => ({ property, operator: 'eq', value });
const funnel = (name, description, steps) => ({
  name,
  type: 'funnel',
  description,
  parameters: { window: FUNNEL_WINDOW_MIN, steps },
});
const goal = (name, value) => ({
  name,
  type: 'goal',
  description: '',
  parameters: { type: 'event', value },
});
const attribution = (model) => ({
  name: `Атрибуция заявки: ${model}`,
  type: 'attribution',
  description: '',
  parameters: { model, type: 'event', step: 'lead_submit' },
});

export const REPORTS = [
  goal('Цель: заявка', 'lead_submit'),
  goal('Цель: открыл форму', 'lead_open'),
  goal('Цель: исходящий клик', 'outbound_click'),
  goal('Цель: регистрация на воркшоп', 'workshop_register'),
  goal('Цель: заявка с визитки', 'card_lead'),
  funnel('Воронка: лид', 'Любая страница → форма → заявка', [
    path('/*'),
    ev('lead_open'),
    ev('lead_submit'),
  ]),
  ...Object.entries(LANDING_RU).map(([id, slug]) =>
    funnel(`Воронка: посадочная ${id}`, `/ru/${slug} → цены → форма → заявка`, [
      path(`/ru/${slug}`),
      ev('pricing_view'),
      ev('lead_open'),
      ev('lead_submit'),
    ])
  ),
  funnel('Воронка: контент → лид', 'Журнал → дочитал 75% → форма → заявка', [
    path('/ru/journal/*'),
    ev('read_depth', [eq('depth', '75')]),
    ev('lead_open'),
    ev('lead_submit'),
  ]),
  funnel('Воронка: воркшоп', 'Страница сессии → регистрация → календарь', [
    path('/ru/workshop/*'),
    ev('workshop_register'),
    ev('workshop_calendar_add'),
  ]),
  funnel('Воронка: Telegram', 'Любая страница → клик в Telegram', [
    path('/*'),
    ev('outbound_click', [eq('kind', 'telegram')]),
  ]),
  attribution('first-click'),
  attribution('last-click'),
];

const f = (name, operator, value) => ({ name, operator, value });

export const SEGMENTS = [
  {
    name: 'Статьи',
    parameters: {
      match: 'any',
      filters: [f('utmMedium', 'eq', 'article'), f('referrer', 're', 'vc\.ru|dev\.to|hackernoon')],
    },
  },
  {
    name: 'Органика',
    parameters: {
      match: 'all',
      filters: [f('referrer', 're', '(yandex|google)\.'), f('utmMedium', 'neq', 'cpc')],
    },
  },
  {
    name: 'Telegram',
    parameters: {
      match: 'any',
      filters: [f('utmSource', 'eq', 'telegram'), f('referrer', 're', 't\.me|telegram')],
    },
  },
  { name: 'Директ', parameters: { match: 'all', filters: [f('utmMedium', 'eq', 'cpc')] } },
  { name: 'Мобайл', parameters: { match: 'all', filters: [f('device', 'eq', 'mobile')] } },
];
