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

export interface Service {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export interface B2bGuarantee {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}
