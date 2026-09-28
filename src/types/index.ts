import type { LucideIcon } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';
import type { LandingId } from '../config/landings';

export interface ServiceMeta {
  id: string;
  Icon: LucideIcon;
  /** Service landing this homepage card links to; absent = card opens the contact form. */
  landingId?: LandingId;
}

export interface LandingTier {
  id: string;
  hours: number;
  /** Subscription package: price is per month and `hours` are included monthly. */
  monthly?: boolean;
}

export interface LandingMeta {
  Icon: LucideIcon;
  /** `services` item id preselected in the contact form. */
  serviceId: string;
  tiers: LandingTier[];
  scopeIds: string[];
  stepIds: string[];
  faqIds: string[];
  caseSlugs: string[];
}

export interface B2bGuaranteeMeta {
  id: string;
  Icon: LucideIcon;
}

export interface ExperienceMeta {
  id: string;
  period: string;
}

export interface ProcessStepMeta {
  id: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  wordmarkClass: string;
  url: string;
  MarkIcon: ComponentType<{ className?: string; style?: CSSProperties }>;
  accentTextClass: string;
  accentTextOnLightClass: string;
  accentBorderClass: string;
  accentShadowClass: string;
  ctaButtonClass: string;
  techStack: string[];
  /** Absent = live. 'maintenance' swaps the outbound CTA for a disabled,
   *  non-linking notice instead of sending visitors to a dead site. */
  status?: 'maintenance';
}
