/** Journal pre-filtered to case studies — the "Кейсы" nav target. */
export const CASES_HREF = '/journal?filter=cases';

/** Single contact / CTA target used by the header CTA and the mobile menu. */
export const CTA_HREF = '/#contact';

/** Primary site sections, in page-flow order. `key` maps to messages `nav.<key>`. */
export const NAV_ITEMS = [
  { key: 'services', href: '/#services' },
  { key: 'b2b', href: '/#b2b' },
  { key: 'cases', href: CASES_HREF },
  { key: 'experience', href: '/#experience' },
  { key: 'journal', href: '/journal' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Footer nav column — a subset of NAV_ITEMS, reusing the same hrefs and `nav.*` labels. */
export const FOOTER_NAV_KEYS = ['services', 'b2b', 'cases'] as const;

/** Bottom island on mobile — icon-only quick access. `key` maps to `nav.<key>`. */
export const MOBILE_NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'journal', href: '/journal' },
  { key: 'cases', href: CASES_HREF },
  { key: 'contactShort', href: CTA_HREF, accent: true },
] as const;

export type MobileNavItem = (typeof MOBILE_NAV_ITEMS)[number];

type QueryLike = Pick<URLSearchParams, 'get'> | null;

/**
 * Shared active-state test for the burger menu and the bottom island — one rule,
 * both surfaces. Anchor items (`/#…`) never report active: there is no scroll-spy.
 * `journal` and `cases` both live at `/journal`; the `?filter=cases` query is the
 * only thing that separates them.
 */
export function isNavActive(key: string, pathname: string, searchParams: QueryLike): boolean {
  const filter = searchParams?.get('filter');
  switch (key) {
    case 'home':
      return pathname === '/';
    case 'cases':
      return pathname === '/journal' && filter === 'cases';
    case 'journal':
      return (pathname === '/journal' || pathname.startsWith('/journal/')) && filter !== 'cases';
    default:
      return false;
  }
}
