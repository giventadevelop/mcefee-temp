'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const STYLE_RELOAD_KEY = 'mh-style-guard-reloaded';
const CSS_HREF_KEY = 'mh-next-css-hrefs';

/**
 * PublicOrganicDesignBody is only mounted on main-app chrome (not /mosc*).
 * Treat a missing pathname as "keep modernist applied" — never strip classes
 * because usePathname() can briefly be null during HMR / remount after idle.
 */
function shouldApplyModernistDesign(pathname: string | null): boolean {
  const path =
    pathname ||
    (typeof window !== 'undefined' ? window.location.pathname : null);
  if (!path) return true;
  if (path.startsWith('/admin')) return false;
  if (path.startsWith('/mosc')) return false;
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
 * True only when modernist CSS is *actually applied* to the body.
 * Do not scan stylesheet text — disabled/orphaned HMR sheets still expose
 * cssRules and would falsely report healthy (idle FOUC stays broken).
 */
function isModernistCssAlive(): boolean {
  if (typeof document === 'undefined') return true;
  if (!document.body.classList.contains('modernist-home')) return false;
  return Boolean(getComputedStyle(document.body).getPropertyValue('--mh-bg').trim());
}

function pageNeedsModernistCss(): boolean {
  return Boolean(
    document.querySelector(
      '.mh-poster-hero, .mh-events-hero, main.modernist-home, .mh-events-page, .mh-onsale-band, .mh-section'
    )
  );
}

function getNextCssLinks(): HTMLLinkElement[] {
  return Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  ).filter((l) => (l.href || '').includes('/_next/'));
}

/** Remember healthy Next CSS hrefs so we can reinject after idle HMR removes them. */
function rememberNextCssHrefs() {
  const hrefs = getNextCssLinks().map((l) => l.href).filter(Boolean);
  if (hrefs.length === 0) return;
  try {
    sessionStorage.setItem(CSS_HREF_KEY, JSON.stringify(hrefs));
  } catch {
    /* ignore */
  }
}

function rememberedNextCssHrefs(): string[] {
  try {
    const raw = sessionStorage.getItem(CSS_HREF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((h) => typeof h === 'string') : [];
  } catch {
    return [];
  }
}

/** Re-enable / re-insert Next.js CSS <link> tags dropped or disabled by idle HMR. */
function reinjectNextStylesheets(): number {
  let touched = 0;

  for (const link of getNextCssLinks()) {
    if (link.disabled) {
      link.disabled = false;
      touched += 1;
    }
  }

  if (isModernistCssAlive()) return touched;

  // Clone existing Next links (forces browser to re-apply).
  for (const link of getNextCssLinks()) {
    const clone = link.cloneNode(true) as HTMLLinkElement;
    clone.disabled = false;
    link.parentNode?.insertBefore(clone, link.nextSibling);
    link.remove();
    touched += 1;
  }

  if (isModernistCssAlive()) return touched;

  // Links were removed entirely — restore from remembered hrefs.
  const existing = new Set(getNextCssLinks().map((l) => l.href));
  for (const href of rememberedNextCssHrefs()) {
    if (existing.has(href)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    existing.add(href);
    touched += 1;
  }

  return touched;
}

/**
 * After idle, Next.js HMR can remove or disable stylesheet <link> tags —
 * body keeps HTML but all body.modernist-home rules vanish until hard refresh.
 * Restore classes, reinject sheets, then reload once if still dead.
 */
function recoverModernistStyles(pathname: string | null) {
  applyModernistBodyClasses(pathname);

  if (!shouldApplyModernistDesign(pathname)) return;
  if (!pageNeedsModernistCss()) return;

  if (isModernistCssAlive()) {
    rememberNextCssHrefs();
    try {
      sessionStorage.removeItem(STYLE_RELOAD_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  // Soft recover first (no full navigation).
  reinjectNextStylesheets();
  applyModernistBodyClasses(pathname);

  if (isModernistCssAlive()) {
    rememberNextCssHrefs();
    try {
      sessionStorage.removeItem(STYLE_RELOAD_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  // Still dead — full reload so layout CSS bundle is fetched again.
  try {
    if (sessionStorage.getItem(STYLE_RELOAD_KEY) === '1') return;
    sessionStorage.setItem(STYLE_RELOAD_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
  console.warn(
    '[PublicOrganicDesignBody] Modernist CSS missing after idle/HMR — reloading to restore styles'
  );
  window.location.reload();
}

/**
 * Applies `modernist-home` + `organic-home` on public pages and guards against
 * idle/HMR CSS loss (unstyled text + raw hero images until hard refresh).
 *
 * CSS is also imported from `src/app/layout.tsx` into the root layout bundle.
 */
export default function PublicOrganicDesignBody() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    recoverModernistStyles(pathname);

    const onReturn = () => {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      recoverModernistStyles(window.location.pathname);
    };

    // Periodic guard: catch HMR drops while the tab stays visible but idle.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!shouldApplyModernistDesign(window.location.pathname)) return;
      if (!pageNeedsModernistCss()) return;
      if (isModernistCssAlive()) {
        rememberNextCssHrefs();
        return;
      }
      recoverModernistStyles(window.location.pathname);
    }, 2500);

    document.addEventListener('visibilitychange', onReturn);
    window.addEventListener('pageshow', onReturn);
    window.addEventListener('focus', onReturn);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onReturn);
      window.removeEventListener('pageshow', onReturn);
      window.removeEventListener('focus', onReturn);

      // Only strip when leaving public modernist routes. Never strip on null /
      // Fast Refresh remount while still on `/`, `/events`, etc.
      const livePath = window.location.pathname;
      if (livePath.startsWith('/admin') || livePath.startsWith('/mosc')) {
        document.body.classList.remove('modernist-home', 'organic-home');
      }
    };
  }, [pathname]);

  return null;
}
