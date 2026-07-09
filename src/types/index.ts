import type { LucideIcon } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  gradient: string;
}

export interface ServiceMeta {
  id: string;
  Icon: LucideIcon;
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
  accentBorderClass: string;
  accentShadowClass: string;
  ctaButtonClass: string;
  techStack: string[];
}
