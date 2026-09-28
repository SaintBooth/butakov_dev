import { LANDING_IDS, LANDING_SLUGS } from './landings';

/** Locale-stripped pathname (next-intl `usePathname`) of any service landing. Slugs are unique across locales. */
function isLandingPath(pathname: string): boolean {
  const slug = pathname.replace(/^\//, '');
  return LANDING_IDS.some((id) => LANDING_SLUGS[id].ru === slug || LANDING_SLUGS[id].en === slug);
}

/** Journal pre-filtered to case studies — the "Кейсы" nav target. */
export const CASES_HREF = '/journal?filter=cases';

/** Single contact / CTA target used by the header CTA and the mobile menu. */
export const CTA_HREF = '/#contact';

/** Homepage services block — the "All services" fallback under the services menu. */
export const SERVICES_HREF = '/#services';

/**
 * Primary site sections. `key` maps to messages `nav.<key>`. `services` renders
 * as a menu of the service landings (config/landings), its href is the fallback.
 */
export const NAV_ITEMS = [
  { key: 'services', href: SERVICES_HREF },
  { key: 'cases', href: CASES_HREF },
  { key: 'journal', href: '/journal' },
  { key: 'about', href: '/#experience' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Footer nav column — same items, hrefs and `nav.*` labels as the header. */
export const FOOTER_NAV_KEYS = ['services', 'cases', 'journal', 'about'] as const;

/** Bottom tab bar on mobile: icon + label. `sheet` opens the services sheet, `contact` the form modal. */
export const MOBILE_NAV_ITEMS = [
  { key: 'services', kind: 'sheet' },
  { key: 'cases', kind: 'link', href: CASES_HREF },
  { key: 'journal', kind: 'link', href: '/journal' },
  { key: 'request', kind: 'contact' },
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
    case 'services':
      return isLandingPath(pathname);
    case 'cases':
      return pathname === '/journal' && filter === 'cases';
    case 'journal':
      return (pathname === '/journal' || pathname.startsWith('/journal/')) && filter !== 'cases';
    default:
      return false;
  }
}
