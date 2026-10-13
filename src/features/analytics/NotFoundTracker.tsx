'use client';

import { useEffect } from 'react';
import { track } from './track';

export function NotFoundTracker() {
  useEffect(() => {
    track('not_found', { path: window.location.pathname });
  }, []);
  return null;
}
