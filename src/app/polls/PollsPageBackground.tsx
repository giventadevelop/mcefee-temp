'use client';

import { useLayoutEffect } from 'react';
import '@/styles/modernist-homepage.css';

/**
 * Applies the Modernist design system (same as home / events / gallery) to the Polls page.
 */
export default function PollsPageBackground() {
  useLayoutEffect(() => {
    document.body.classList.add('modernist-home');
    return () => {
      document.body.classList.remove('modernist-home');
    };
  }, []);

  return null;
}
