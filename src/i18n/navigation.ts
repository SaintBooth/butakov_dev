import { createNavigation } from 'next-intl/navigation';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: ['en', 'ru'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
