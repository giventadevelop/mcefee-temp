import { Suspense } from 'react';
import Image from 'next/image';
import GalleryPageBackground from './GalleryPageBackground';
import { GalleryContent } from './GalleryContent';
import '@/styles/modernist-homepage.css';

export default function GalleryPage() {
  return (
    <>
      <GalleryPageBackground />
      <main className="mh-events-page modernist-home mh-gallery-page">
        <section className="mh-events-hero" aria-label="Gallery">
          <figure className="mh-events-hero-media mh-grayscale">
            <Image
              src="/images/default_placeholder_hero_image.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </figure>
          <div className="mh-events-hero-scrim" aria-hidden="true" />
          <div className="mh-events-hero-content">
            <div className="mh-events-hero-kicker">
              <span className="mh-dot" aria-hidden="true" />
              <span>MCEFEE memories</span>
            </div>
            <h1>Gallery</h1>
            <p className="mh-events-hero-lede">
              Explore albums and event photos in one place.
            </p>
          </div>
        </section>

        <div className="mh-events-body">
          <Suspense
            fallback={<div className="mh-events-loading">Loading gallery…</div>}
          >
            <GalleryContent />
          </Suspense>
        </div>
      </main>
    </>
  );
}
