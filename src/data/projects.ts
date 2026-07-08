import type { ProjectMeta } from '../types';

export const projects: ProjectMeta[] = [
  {
    id: 'promptspace',
    name: 'PromptSpace',
    wordmarkClass: 'font-extrabold',
    url: 'https://promptspace.ru/',
    markClassName: 'rounded-2xl',
    markStyle: {
      background: 'linear-gradient(135deg, #c084fc, #a855f7 50%, #7c3aed)',
    },
    markLabel: 'PS',
    accentTextClass: 'text-violet-300',
    accentBorderClass: 'border-violet-500/30 hover:border-violet-400/60',
    accentShadowClass: 'hover:shadow-violet-500/20',
    ctaButtonClass: 'bg-violet-500 hover:bg-violet-400 shadow-violet-500/25',
    techStack: ['Next.js 15 SSR', 'Django Ninja REST', 'PostgreSQL + pgvector', 'HashiCorp Vault'],
  },
  {
    id: 'solvops',
    name: 'solvops',
    wordmarkClass: 'font-bold lowercase',
    url: 'https://getsolvops.com/',
    markClassName: 'rounded-2xl',
    markStyle: {
      background: '#00bba7',
    },
    accentTextClass: 'text-teal-300',
    accentBorderClass: 'border-teal-500/30 hover:border-teal-400/60',
    accentShadowClass: 'hover:shadow-teal-500/20',
    ctaButtonClass: 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25',
    techStack: ['Next.js 15 PWA', 'Django Ninja REST', 'pgvector + LLM', 'HashiCorp Vault'],
  },
];
