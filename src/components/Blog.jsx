import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';
import { blogPosts } from '../data/blogPosts.js';

export default function Blog({ onArticleSelect }) {
  const sliderRef = useRef(null);

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    const amount = window.innerWidth > 1024 ? 480 : 432;
    sliderRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="blog" className="py-24 relative z-10 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Статьи и мысли</h2>
          </div>
          <div className="mt-6 md:mt-0 hidden md:flex items-center gap-2">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-white/80 transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm flex items-center justify-center text-slate-600 hover:text-teal-600 hover:bg-white/80 transition-all active:scale-95">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div ref={sliderRef} className="flex overflow-x-auto gap-6 sm:gap-8 snap-x snap-mandatory no-scrollbar pb-12 pt-4 scroll-smooth">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onArticleSelect(post)}
              className="shrink-0 w-[85vw] sm:w-[400px] lg:w-[450px] snap-start group bg-white/60 backdrop-blur-xl rounded-3xl border border-white overflow-hidden hover:shadow-2xl hover:border-teal-200/80 transition-all flex flex-col h-full cursor-pointer shadow-xl shadow-slate-200/40"
            >
              <div className={`h-40 w-full bg-gradient-to-br ${post.gradient} relative overflow-hidden flex-shrink-0`}>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-sm border border-white/50">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" /> {post.category}
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-10 bg-white/40">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors leading-snug">{post.title}</h3>
                <p className="text-slate-600 font-medium text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{post.excerpt}</p>
                <div className="text-teal-600 font-bold text-sm flex items-center gap-1.5 mt-auto group/link">
                  Читать статью <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
