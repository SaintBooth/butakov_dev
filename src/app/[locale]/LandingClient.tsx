'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Blog from '@/features/blog/Blog';
import type { BlogPost } from '@/types';

const ArticleModal = dynamic(() => import('@/features/blog/ArticleModal'));

export function LandingClient() {
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  return (
    <>
      <Blog onArticleSelect={setSelectedArticle} />
      {selectedArticle && (
        <ArticleModal post={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </>
  );
}
