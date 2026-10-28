'use client';

import { useLayoutEffect } from 'react';
import '@/styles/modernist-homepage.css';
import HomeParticleBackground from '@/components/HomeParticleBackground';

type SubpageHomeDesignBackgroundProps = {
  /** Optional body class for page-specific overrides (e.g. `gallery-page-background`) */
  bodyClass?: string;
};

/**
 * Applies the homepage design system to public subpages.
 * Body classes `modernist-home` + `organic-home` are also set globally by
 * PublicOrganicDesignBody; this keeps optional page-specific body classes.
 */
export default function SubpageHomeDesignBackground({ bodyClass }: SubpageHomeDesignBackgroundProps) {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('modernist-home', 'organic-home');
    if (bodyClass) document.body.classList.add(bodyClass);
    return () => {
      document.body.classList.remove('home-page-background');
      if (bodyClass) document.body.classList.remove(bodyClass);
      /* PublicOrganicDesignBody owns modernist-home / organic-home cleanup */
    };
  }, [bodyClass]);

  return <HomeParticleBackground />;
}
