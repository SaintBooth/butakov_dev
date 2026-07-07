'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Cases from '@/features/cases/Cases';
import Blog from '@/features/blog/Blog';
import type { PortfolioCase, BlogPost } from '@/types';

const CaseModal = dynamic(() => import('@/features/cases/CaseModal'));
const ArticleModal = dynamic(() => import('@/features/blog/ArticleModal'));

export function LandingClient() {
  const [selectedCase, setSelectedCase] = useState<PortfolioCase | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  return (
    <>
      <Cases onCaseSelect={setSelectedCase} />
      <Blog onArticleSelect={setSelectedArticle} />
      {selectedCase && <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      {selectedArticle && (
        <ArticleModal post={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </>
  );
}
