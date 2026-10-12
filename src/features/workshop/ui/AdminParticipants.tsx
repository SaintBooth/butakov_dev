'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import type { RegistrationStatus } from '@/config/workshop';
import type { AdminParticipant } from '../db/adminView';
import { PII_CLASS } from './formStyles';

export type StatusFilter = RegistrationStatus | 'all';
export const STATUS_FILTERS: StatusFilter[] = ['all', 'registered', 'attended', 'cancelled'];

export function filterParticipants<T extends { status: RegistrationStatus }>(
  list: T[],
  f: StatusFilter
): T[] {
  return f === 'all' ? list : list.filter((p) => p.status === f);
}

export function formatRecommend(template: string, score: number): string {
  return template.replace('{score}', String(score));
}

// Plain strings: translator functions cannot cross the server→client boundary.
export interface AdminLabels {
  filter: Record<StatusFilter, string>;
  status: Record<RegistrationStatus, string>;
  recommendTemplate: string;
  followup: string;
  empty: string;
}

const chipBase = 'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors';

function chipClass(active: boolean): string {
  return clsx(
    chipBase,
    active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
  );
}

export function AdminParticipants({
  people,
  labels,
}: {
  people: AdminParticipant[];
  labels: AdminLabels;
}) {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const shown = filterParticipants(people, filter);
  return (
    <section className="admin-participants flex flex-col gap-4">
      <div className="admin-participants__filters flex flex-wrap gap-2" role="group">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={clsx('admin-participants__chip', chipClass(filter === f))}
          >
            {labels.filter[f]}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm text-slate-500">{labels.empty}</p>}
      <ul className={clsx('admin-participants__list flex flex-col gap-3', PII_CLASS)}>
        {shown.map((p) => (
          <li
            key={p.registrationId}
            className="admin-participants__card rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-slate-900">{p.fullName}</p>
              <span className="text-xs text-slate-500">{labels.status[p.status]}</span>
            </div>
            {(p.positionTitle || p.company) && (
              <p className="text-sm text-slate-600">
                {[p.positionTitle, p.company].filter(Boolean).join(', ')}
              </p>
            )}
            <a href={`mailto:${p.email}`} className="text-sm text-teal-700 underline">
              {p.email}
            </a>
            {p.recommendScore !== null && (
              <p className="mt-2 text-sm text-slate-700">
                {formatRecommend(labels.recommendTemplate, p.recommendScore)}
                {p.mostUseful && <> · «{p.mostUseful}»</>}
              </p>
            )}
            {p.followupAnswered && <p className="text-xs text-slate-500">{labels.followup}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
