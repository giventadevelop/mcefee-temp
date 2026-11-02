import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  fetchPublishedPublicProfileForPagesServer,
} from '@/lib/profileSiteServer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'The Malayali Cultural Exchange Foundation for Education and Events preserves and promotes the cultural heritage of Kerala.',
};

export default async function ProfileAboutPage() {
  const profile = await fetchPublishedPublicProfileForPagesServer();
  if (!profile) {
    return (
      <main className="mh-events-page modernist-home">
        <section className="mh-events-hero" aria-label="About">
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
              <span>About Us</span>
            </div>
            <h1>About MCEFEE</h1>
            <p className="mh-events-hero-lede">
              A community in New Jersey preserving Malayali culture, education, and a sense of home.
            </p>
          </div>
        </section>

        <section className="mh-about" aria-label="About Us">
          <div>
            <span className="mh-eyebrow" style={{ marginBottom: 14 }}>
              About Us
            </span>
            <h2>Preserve and promote the rich cultural heritage of Kerala</h2>
          </div>
          <div className="mh-about-copy">
            <p>
              The Unite India Corporation Foundation for Education and Events is a vibrant,
              community-driven organization based in New Jersey, USA, dedicated to reviving real
              Malayali culture, empowering the next generation through education, and offering a
              nostalgic sense of home to our community.
            </p>
            <p>
              Our mission is to preserve and promote the rich cultural heritage of Kerala while
              fostering a deeper connection among Malayalis in the USA, creating a sense of belonging
              and unity.
            </p>
            <div className="mh-about-legal">
              <p className="mh-eyebrow" style={{ color: 'var(--mh-neutral-700)' }}>
                Legal name
              </p>
              <p className="mh-about-legal-name">
                Malayali Cultural Exchange Foundation for Education and Events
              </p>
              <p className="mh-about-legal-contact">
                New Jersey, USA · <a href="tel:+19085168781">(908) 516-8781</a> ·{' '}
                <a href="mailto:Contactus@mcefee.org">Contactus@mcefee.org</a>
              </p>
              <p>
                <Link href="/contact" className="mh-btn mh-btn-primary">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-caption text-sm uppercase tracking-widest text-primary mb-2">About</p>
        <h1 className="font-heading text-4xl font-semibold text-foreground mb-4">{profile.displayName}</h1>
        {profile.headline && (
          <p className="font-body text-xl text-muted-foreground mb-8">{profile.headline}</p>
        )}
        {profile.profileImageUrl && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-8 border-4 border-primary/30">
            <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" unoptimized />
          </div>
        )}
        {profile.bioMarkdown?.trim() ? (
          <div className="font-body text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed mb-10">
            {profile.bioMarkdown}
          </div>
        ) : (
          <p className="font-body text-muted-foreground mb-10">Bio coming soon.</p>
        )}
        {(profile.location || profile.languages) && (
          <p className="text-sm text-muted-foreground mb-8">
            {[profile.location, profile.languages].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="px-6 py-3 bg-primary text-primary-foreground rounded-sacred font-semibold">
            Contact
          </Link>
          <Link href="/#profile-writings" className="px-6 py-3 border-2 border-primary text-primary rounded-sacred font-semibold">
            Perspectives
          </Link>
          <Link href="/" className="px-6 py-3 border border-border text-foreground rounded-sacred font-semibold">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
