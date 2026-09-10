'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Direction } from './cardSchema';
import { reachGoal } from './analytics';

interface PathButtonProps {
  active: boolean;
  dimmed: boolean;
  title: string;
  desc: string;
  onSelect: () => void;
}

function PathButton({ active, dimmed, title, desc, onSelect }: PathButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'rounded-2xl border p-4 text-left transition-[transform,border-color,box-shadow,opacity] duration-150 active:scale-[0.99]',
        active
          ? 'border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.16)]'
          : 'border-slate-200 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-teal-300',
        dimmed && 'pointer-events-none opacity-50'
      )}
    >
      <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-snug text-slate-500">{desc}</p>
    </button>
  );
}

export default function CardFork() {
  const t = useTranslations('card.fork');
  const [selected, setSelected] = useState<Direction | null>(null);

  const choose = (dir: Direction) => {
    setSelected(dir);
    reachGoal(dir === 'audit' ? 'card_path_audit' : 'card_path_ai');
  };

  return (
    <div
      className="card-enter flex flex-col gap-3"
      style={{ ['--card-enter-delay' as string]: '150ms' }}
    >
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{t('heading')}</h2>

      <PathButton
        active={selected === 'audit'}
        dimmed={selected !== null && selected !== 'audit'}
        title={t('auditTitle')}
        desc={t('auditDesc')}
        onSelect={() => choose('audit')}
      />
      <PathButton
        active={selected === 'ai'}
        dimmed={selected !== null && selected !== 'ai'}
        title={t('aiTitle')}
        desc={t('aiDesc')}
        onSelect={() => choose('ai')}
      />

      {/* Форма подключается в Task 11 */}
      <div className="card-reveal" data-open={selected !== null}>
        <div className="card-reveal-inner" />
      </div>
    </div>
  );
}
