import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

interface LandingFaqProps {
  heading: string;
  items: FaqItem[];
}

/** Items are resolved by the page so the visible FAQ and the FAQPage JSON-LD share one source. */
export default function LandingFaq({ heading, items }: LandingFaqProps) {
  return (
    <section className="py-16 md:py-24 relative z-10 border-t border-white/40 scroll-reveal">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 md:mb-10">{heading}</h2>
        <div className="space-y-3">
          {items.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl bg-white/70 backdrop-blur-md border border-slate-200/80 open:border-teal-200 open:bg-white transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base md:text-lg">{q}</h3>
                <ChevronDown
                  className="w-5 h-5 text-teal-600 flex-shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-slate-600 font-medium leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
