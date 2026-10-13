'use client';

import type { MouseEvent, ReactNode } from 'react';
import { CTA_HREF } from '@/config/nav';
import type { LeadPlacement } from '@/features/analytics/events';
import { track } from '@/features/analytics/track';
import { Link } from '@/i18n/navigation';
import { useContactModal } from './ContactModalProvider';

interface ContactTriggerProps {
  children: ReactNode;
  placement: LeadPlacement;
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
  placement,
  className,
  serviceId,
  ariaLabel,
  onOpen,
}: ContactTriggerProps) {
  const modal = useContactModal();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!modal || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    track('lead_open', serviceId ? { placement, service: serviceId } : { placement });
    onOpen?.();
    modal.open(serviceId, placement);
  };

  return (
    <Link href={CTA_HREF} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
