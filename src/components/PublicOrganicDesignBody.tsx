'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

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

function applyModernistBodyClasses(pathname: string | null) {
  if (typeof document === 'undefined') return;
  if (shouldApplyModernistDesign(pathname)) {
    document.body.classList.add('modernist-home', 'organic-home');
  } else {
    document.body.classList.remove('modernist-home', 'organic-home');
  }
}

/**
 * Applies `modernist-home` + `organic-home` on public pages.
 *
 * CSS is imported from `src/app/layout.tsx` (not here) so the stylesheet
 * stays in the permanent root CSS bundle and cannot be dropped by client
 * HMR after the tab sits idle.
 *
 * Cleanup must NOT blindly strip body classes: Fast Refresh / React remount
 * after idle runs cleanup before the next effect, which left the page as
 * raw unstyled HTML until a hard refresh. Only remove when the live URL is
 * no longer a modernist public route (admin / mosc / leaving the tree).
 */
export default function PublicOrganicDesignBody() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    applyModernistBodyClasses(pathname);

    const reassert = () => {
      applyModernistBodyClasses(window.location.pathname);
    };

    // Tab focus / bfcache restore after idle — re-assert classes if something
    // stripped them while the document was hidden.
    document.addEventListener('visibilitychange', reassert);
    window.addEventListener('pageshow', reassert);

    return () => {
      document.removeEventListener('visibilitychange', reassert);
      window.removeEventListener('pageshow', reassert);

      // Only strip when the live URL is no longer a public modernist route.
      // Keeps classes intact across Fast Refresh remounts on `/`, `/events`, etc.
      if (!shouldApplyModernistDesign(window.location.pathname)) {
        document.body.classList.remove('modernist-home', 'organic-home');
      }
    };
  }, [pathname]);

  return null;
}
