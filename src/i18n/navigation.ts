import { createNavigation } from 'next-intl/navigation';
import { DEFAULT_LOCALE, LOCALES } from './locales';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
});
