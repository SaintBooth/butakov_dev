export const EDIT_FIELDS = ['title', 'time', 'meeting', 'materials', 'capacity'] as const;
export type EditField = (typeof EDIT_FIELDS)[number];

export type Action =
  | { a: 'menu' }
  | { a: 'past' }
  | { a: 'new' }
  | { a: 'cancel' }
  | { a: 'confirm' }
  | { a: 'fix' }
  | { a: 'card'; id: number }
  | { a: 'people'; id: number; page: number }
  | { a: 'link'; id: number }
  | { a: 'edit'; id: number }
  | { a: 'field'; id: number; field: EditField }
  | { a: 'toggle'; id: number }
  | { a: 'summary'; id: number }
  | { a: 'reschedule'; id: number }
  | { a: 'pick'; value: number };

type BareAction = Extract<
  Action,
  { a: 'menu' | 'past' | 'new' | 'cancel' | 'confirm' | 'fix' }
>['a'];
type IdAction = Extract<
  Action,
  { a: 'card' | 'link' | 'edit' | 'toggle' | 'summary' | 'reschedule' }
>['a'];

// Short tags keep callback_data far below Telegram's 64-byte cap.
const BARE: Record<BareAction, string> = {
  menu: 'm',
  past: 'p',
  new: 'n',
  cancel: 'x',
  confirm: 'ok',
  fix: 'fx',
};
const WITH_ID: Record<IdAction, string> = {
  card: 'c',
  link: 'l',
  edit: 'e',
  toggle: 't',
  summary: 's',
  reschedule: 'rs',
};

export function encode(action: Action): string {
  switch (action.a) {
    case 'people':
      return `u:${action.id}:${action.page}`;
    case 'field':
      return `f:${action.id}:${action.field}`;
    case 'pick':
      return `w:${action.value}`;
    case 'card':
    case 'link':
    case 'edit':
    case 'toggle':
    case 'summary':
    case 'reschedule':
      return `${WITH_ID[action.a]}:${action.id}`;
    default:
      return BARE[action.a];
  }
}

const UINT = /^(0|[1-9]\d{0,9})$/;
const num = (s: string | undefined) => (s !== undefined && UINT.test(s) ? Number(s) : null);
const keyOf = <K extends string>(map: Record<K, string>, tag: string) =>
  (Object.keys(map) as K[]).find((k) => map[k] === tag);

export function decode(data: string): Action | null {
  const bare = keyOf(BARE, data);
  if (bare) return { a: bare };
  const parts = data.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const [tag, x, y] = parts;
  const id = num(x);
  if (id === null) return null;
  if (tag === 'u') {
    const page = num(y);
    return page === null ? null : { a: 'people', id, page };
  }
  if (tag === 'f') {
    const field = EDIT_FIELDS.find((f) => f === y);
    return field ? { a: 'field', id, field } : null;
  }
  if (y !== undefined) return null;
  if (tag === 'w') return { a: 'pick', value: id };
  const withId = keyOf(WITH_ID, tag);
  return withId ? { a: withId, id } : null;
}
