import type { ProjectMeta } from '../types';

function PromptSpaceMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1146.02 1146.02"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 8px rgba(166,132,255,.38))' }}
    >
      <rect
        x="146.99"
        y="146.99"
        width="852.05"
        height="852.05"
        rx="257.5"
        ry="257.5"
        fill="#101729"
      />
      <path
        fill="#a684ff"
        d="M723.25,597.31h0c0,79.98-64.83,144.81-144.81,144.81h-5.36c-79.98,0-144.81-64.83-144.81-144.81v-193.61h-108.34s0,188.31,0,188.31c0,139.82,113.34,253.16,253.16,253.16h0c124.24,0,227.56-89.49,249.05-207.53l-98.88-40.33Z"
      />
      <path
        fill="#a684ff"
        d="M616.53,300.85l-45.5,102.84h152.22v193.61h0c61.09-18.57,102.84-74.91,102.84-138.76v-12.67c0-80.1-64.93-145.03-145.03-145.03h-64.54Z"
      />
    </svg>
  );
}

function SolvOpsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1146.02 1146.02"
      className={className}
      style={{ filter: 'drop-shadow(0 3px 8px rgba(227,151,116,.38))' }}
    >
      <rect
        x="146.99"
        y="146.99"
        width="852.05"
        height="852.05"
        rx="257.5"
        ry="257.5"
        fill="#101729"
      />
      <path
        fill="#e39774"
        d="M723.25,597.31h0c0,79.98-64.83,144.81-144.81,144.81h-5.36c-79.98,0-144.81-64.83-144.81-144.81v-193.61h-108.34s0,188.31,0,188.31c0,139.82,113.34,253.16,253.16,253.16h0c124.24,0,227.56-89.49,249.05-207.53l-98.88-40.33Z"
      />
      <path
        fill="#e39774"
        d="M616.53,300.85l-45.5,102.84h152.22v193.61h0c61.09-18.57,102.84-74.91,102.84-138.76v-12.67c0-80.1-64.93-145.03-145.03-145.03h-64.54Z"
      />
    </svg>
  );
}

export const projects: ProjectMeta[] = [
  {
    id: 'promptspace',
    name: 'PromptSpace',
    wordmarkClass: 'font-extrabold',
    url: 'https://promptspace.ru/',
    MarkIcon: PromptSpaceMark,
    accentTextClass: 'text-[#a684ff]',
    accentBorderClass: 'border-[#a684ff]/30 hover:border-[#a684ff]/60',
    accentShadowClass: 'hover:shadow-[#a684ff]/20',
    ctaButtonClass: 'bg-[#a684ff] hover:bg-[#9370ff] shadow-[#a684ff]/25',
    techStack: ['Next.js 15 SSR', 'Django Ninja REST', 'PostgreSQL + pgvector', 'HashiCorp Vault'],
  },
  {
    id: 'solvops',
    name: 'solvops',
    wordmarkClass: 'font-bold lowercase',
    url: 'https://getsolvops.com/',
    MarkIcon: SolvOpsMark,
    accentTextClass: 'text-[#c4663d]',
    accentBorderClass: 'border-[#c4663d]/30 hover:border-[#c4663d]/60',
    accentShadowClass: 'hover:shadow-[#c4663d]/20',
    ctaButtonClass: 'bg-[#c4663d] hover:bg-[#d17646] shadow-[#c4663d]/25',
    techStack: ['Next.js 15 PWA', 'Django Ninja REST', 'pgvector + LLM', 'HashiCorp Vault'],
  },
];
