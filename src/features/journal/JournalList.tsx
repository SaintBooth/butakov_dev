'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Link } from '../../i18n/navigation';
import type { CaseFrontmatter } from '../../utils/cases';
import { OPINION_TAGS } from '../../config/journalTags';

type Filter = 'all' | 'cases' | 'opinions';

interface JournalListProps {
  cases: Array<{ slug: string; frontmatter: CaseFrontmatter }>;
  locale: string;
}

const pillBase = 'px-4 py-2 rounded-full text-sm font-bold border transition-colors flex-shrink-0';
const pillActive = 'bg-teal-500 border-teal-500 text-white';
const pillInactive = 'bg-white/60 border-slate-200 text-slate-600 hover:border-teal-200';

function isOpinion(tags: string[]): boolean {
  return tags.some((tag) => OPINION_TAGS.includes(tag));
}

export default function JournalList({ cases, locale }: JournalListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const isRu = locale === 'ru';

  const filtered = cases.filter(({ frontmatter: fm }) => {
    if (filter === 'all') return true;
    return filter === 'opinions' ? isOpinion(fm.tags) : !isOpinion(fm.tags);
  });

  const tabs: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: isRu ? 'Все' : 'All' },
    { key: 'cases', label: isRu ? 'Кейсы' : 'Cases' },
    { key: 'opinions', label: isRu ? 'Мнения' : 'Opinions' },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={clsx(pillBase, filter === tab.key ? pillActive : pillInactive)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filtered.map(({ slug, frontmatter: fm }) => (
          <Link
            key={slug}
            href={`/journal/${slug}`}
            className="block p-6 sm:p-8 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white hover:border-teal-200/80 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200/40"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600">
              {fm.title}
            </h2>
            <p className="text-slate-600 text-sm mb-3 leading-relaxed">{fm.excerpt}</p>
            <div className="flex items-center gap-3 text-xs font-semibold">
              {fm.metric && <span className="text-teal-600">{fm.metric}</span>}
              {fm.metric && <span className="text-slate-300">·</span>}
              <span className="text-slate-400">{fm.date}</span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm">
            {isRu ? 'Пока нет статей в этой категории.' : 'No articles in this category yet.'}
          </p>
        )}
      </div>
    </>
  );
}
