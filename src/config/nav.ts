/** Primary site sections, in page-flow order. `key` maps to messages `nav.<key>`. */
export const NAV_ITEMS = [
  { key: 'services', href: '/#services' },
  { key: 'b2b', href: '/#b2b' },
  { key: 'cases', href: '/#cases' },
  { key: 'experience', href: '/#experience' },
  { key: 'journal', href: '/journal' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Single contact / CTA target used by the header CTA and the mobile menu. */
export const CTA_HREF = '/#contact';
