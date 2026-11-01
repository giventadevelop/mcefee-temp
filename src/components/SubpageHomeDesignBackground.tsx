'use client';

import { useLayoutEffect } from 'react';
import HomeParticleBackground from '@/components/HomeParticleBackground';

type SubpageHomeDesignBackgroundProps = {
  /** Optional body class for page-specific overrides (e.g. `gallery-page-background`) */
  bodyClass?: string;
};

/**
 * Applies home-page-background (+ optional bodyClass) for glass/particle subpages.
 * modernist-home / organic-home come from layout SSR + PublicOrganicDesignBody;
 * modernist CSS is imported once from root layout.
 */
export default function SubpageHomeDesignBackground({ bodyClass }: SubpageHomeDesignBackgroundProps) {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    if (bodyClass) document.body.classList.add(bodyClass);
    return () => {
      document.body.classList.remove('home-page-background');
      if (bodyClass) document.body.classList.remove(bodyClass);
    };
  }, [bodyClass]);

  return <HomeParticleBackground />;
}
