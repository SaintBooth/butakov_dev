'use client';
import { X, ArrowRight } from 'lucide-react';
import Modal from '../../components/ui/Modal/Modal';
import type { BlogPost } from '../../types';
import { LogoImage } from '../../components/ui/LogoImage/LogoImage';

interface ArticleModalProps {
  post: BlogPost;
  onClose: () => void;
}

export default function ArticleModal({ post, onClose }: ArticleModalProps) {
  return (
    <Modal
      onClose={onClose}
      className="max-w-3xl bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] flex flex-col"
    >
      <button
        onClick={onClose}
        className="sticky top-4 right-4 ml-auto -mb-12 w-10 h-10 bg-white/60 backdrop-blur-md border border-white hover:bg-white/80 rounded-full flex items-center justify-center text-slate-600 transition-all z-20 shadow-sm mr-4"
      >
        <X className="w-5 h-5" />
      </button>
      <div className={`h-32 sm:h-48 w-full bg-gradient-to-br ${post.gradient} flex-shrink-0`} />
      <div className="p-8 sm:p-12 pt-8 relative bg-white/40">
        <span className="px-3 py-1 bg-white/60 backdrop-blur-sm text-teal-700 rounded-lg border border-white shadow-sm text-xs font-bold">
          {post.category}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-6 mb-8 leading-tight">
          {post.title}
        </h2>
        <div className="prose prose-slate prose-teal max-w-none">
          <p className="text-lg text-slate-600 font-medium leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden mb-4">
            <LogoImage
              width={64}
              height={64}
              className="w-full h-full object-cover p-2 bg-slate-900"
            />
          </div>
          <h4 className="font-bold text-slate-900">Александр Бутаков</h4>
          <p className="text-sm text-slate-500 font-medium mb-6">Независимый IT-консультант</p>
          <a
            href="#contact"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-all flex items-center justify-center gap-2 group"
          >
            Обсудить ваш проект
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
