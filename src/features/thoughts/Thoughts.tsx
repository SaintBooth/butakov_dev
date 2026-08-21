'use client';

import { ArrowRight, Calendar, Clock, Quote } from 'lucide-react';
import { useSlider } from '../../components/ui/Slider/useSlider';
import { SliderControls } from '../../components/ui/Slider/SliderControls';
import { Link } from '../../i18n/navigation';
import type { CaseFrontmatter } from '../../utils/cases';
import { OPINION_TAGS } from '../../config/journalTags';

interface ThoughtsProps {
  cases: Array<{ slug: string; frontmatter: CaseFrontmatter; readingTime: number }>;
  copy: {
    heading: string;
    subheading: string;
    readMore: string;
  };
  dateLocale: string;
  readMinutesLabel: string;
}

function displayTag(tags: string[]): string | undefined {
  return tags.find((tag) => !OPINION_TAGS.includes(tag));
}

export default function Thoughts({ cases, copy, dateLocale, readMinutesLabel }: ThoughtsProps) {
  const { ref, scroll } = useSlider();

  if (cases.length === 0) return null;

  return (
    <section id="thoughts" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{copy.heading}</h2>
            <p className="text-slate-600 text-lg font-medium">{copy.subheading}</p>
          </div>
          <SliderControls
            onLeft={() => scroll('left')}
            onRight={() => scroll('right')}
            className="mt-6 md:mt-0 hidden md:flex"
          />
        </div>

        <div
          ref={ref}
          className="flex overflow-x-auto gap-6 sm:gap-8 snap-x snap-mandatory no-scrollbar pb-12 pt-4 scroll-smooth"
        >
          {cases.map(({ slug, frontmatter: fm, readingTime }) => (
            <Link
              key={slug}
              href={`/journal/${slug}`}
              className="shrink-0 w-[85vw] sm:w-[400px] lg:w-[420px] snap-start group bg-white/60 backdrop-blur-xl rounded-3xl border border-white p-6 sm:p-8 hover:shadow-2xl hover:border-teal-200/80 transition-all flex flex-col shadow-xl shadow-slate-200/40"
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  <Quote className="w-4 h-4 text-teal-600" />
                </span>
                {displayTag(fm.tags) && (
                  <span className="text-xs font-semibold text-teal-600 italic">
                    {displayTag(fm.tags)}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors leading-snug">
                {fm.title}
              </h3>
              <p className="text-slate-600 font-medium text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                {fm.excerpt}
              </p>

              <p className="text-sm italic text-slate-500 border-l-2 border-teal-100 pl-3 mb-6">
                {fm.metric}
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4 mt-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(fm.date).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readingTime} {readMinutesLabel}
                </span>
              </div>

              <span className="text-teal-600 font-bold text-sm flex items-center gap-1.5 group/link">
                {copy.readMore}
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
