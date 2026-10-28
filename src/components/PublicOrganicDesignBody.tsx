'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/modernist-homepage.css';

/**
 * Public routes that should NOT use the homepage modernist design system.
 * Admin stays on the default admin UI; MOSC shells have their own layouts.
 */
function shouldApplyModernistDesign(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/mosc')) return false;
  return true;
}

/**
 * Applies `modernist-home` + `organic-home` on public pages and keeps
 * `modernist-homepage.css` in the main-app layout chunk.
 *
 * Why this exists (ported from kcnj-prod):
 * Page-level effects that add then remove `body.modernist-home` on unmount
 * drop all scoped styles during Fast Refresh / React remounts after idle —
 * the page renders as raw HTML until a hard refresh. Owning the class from
 * ConditionalLayout (pathname-driven) keeps styling stable.
 */
export default function PublicOrganicDesignBody() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const apply = shouldApplyModernistDesign(pathname);
    if (apply) {
      document.body.classList.add('modernist-home', 'organic-home');
    } else {
      document.body.classList.remove('modernist-home', 'organic-home');
    }
    return () => {
      document.body.classList.remove('modernist-home', 'organic-home');
    };
  }, [pathname]);

  return null;
}
