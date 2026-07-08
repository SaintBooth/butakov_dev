import type { LucideIcon } from 'lucide-react';

export interface PortfolioCase {
  id: number;
  title: string;
  category: string;
  description: string;
  problem?: string;
  solution?: string;
  fullDescription?: string;
  metric: string;
  result?: string;
  tags: string[];
  techStack?: string[];
  gradient: string;
}

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
