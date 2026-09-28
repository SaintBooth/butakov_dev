'use client';

import type { MouseEvent, ReactNode } from 'react';
import { CTA_HREF } from '@/config/nav';
import { Link } from '@/i18n/navigation';
import { useContactModal } from './ContactModalProvider';

interface ContactTriggerProps {
  children: ReactNode;
  className?: string;
  serviceId?: string;
  ariaLabel?: string;
  onOpen?: () => void;
}

/**
 * Renders a real link to the homepage contact section, so crawlers and no-JS
 * visitors still reach the form; with JS it opens the modal in place instead.
 */
export function ContactTrigger({
  children,
  className,
  serviceId,
  ariaLabel,
  onOpen,
}: ContactTriggerProps) {
  const modal = useContactModal();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!modal || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen?.();
    modal.open(serviceId);
  };

  return (
    <Link href={CTA_HREF} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
