'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EventDetailsDTO, EventSponsorsDTO, ExecutiveCommitteeTeamMemberDTO } from '@/types';
import type { FeaturedEventWithMedia } from '@/lib/homepage/featuredEvents';
import { getTenantId } from '@/lib/env';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import GivebutterDonateButton from '@/components/GivebutterDonateButton';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import HeroSection from '@/components/HeroSection';
import '@/styles/modernist-homepage.css';

const HERO_IMAGE = '/images/modernist/mcefee/kerala_riverside.jpeg';
const FALLBACK_POSTER = '/images/modernist/mcefee/spark_kerala_2026_wide.jpg';

const SERVICES = [
  {
    num: '01',
    title: 'Traditional Dance & Music',
    description: 'Experience the rich heritage of Kerala through dance and music workshops.',
  },
  {
    num: '02',
    title: 'Art & Craft Workshops',
    description: 'Learn traditional Kerala art forms and crafts through hands-on workshops.',
  },
  {
    num: '03',
    title: 'Kerala Folklore and Tribal Traditions',
    description: 'Introduce lesser-known folk dances like Theyyam, Padayani, and Poothan Thira.',
  },
  {
    num: '04',
    title: 'Kerala Cuisine Classes',
    description: 'Master the art of traditional Kerala cooking with expert chefs.',
  },
];

function formatEventDate(dateString?: string, timezone?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(`${dateString}T12:00:00`);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: timezone || undefined,
    });
  } catch {
    return dateString;
  }
}

function formatTimeRange(start?: string, end?: string): string {
  const fmt = (t?: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    if (Number.isNaN(h)) return t;
    const d = new Date();
    d.setHours(h, m || 0, 0, 0);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  const a = fmt(start);
  const b = fmt(end);
  if (a && b) return `${a} — ${b}`;
  return a || b || '—';
}

function admissionLabel(event: EventDetailsDTO): string {
  const raw = (event.admissionType || '').toUpperCase();
  if (raw.includes('DONAT') || raw.includes('CHARITY')) return 'Charity';
  if (raw.includes('TICKET') || raw.includes('PAID')) return 'Ticketed';
  if (raw.includes('FREE') || !raw) return 'Free';
  return event.admissionType || 'Free';
}

function admissionTagClass(label: string): string {
  if (label === 'Ticketed') return 'mh-tag mh-tag-accent';
  if (label === 'Charity') return 'mh-tag mh-tag-outline';
  return 'mh-tag mh-tag-neutral';
}

function eventHref(event: EventDetailsDTO): string {
  return event.id ? `/events/${event.id}` : '/events';
}

function parseEventList(data: unknown): EventDetailsDTO[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as EventDetailsDTO[];
    if (obj._embedded && typeof obj._embedded === 'object') {
      const emb = obj._embedded as Record<string, unknown>;
      const key = Object.keys(emb).find((k) => Array.isArray(emb[k]));
      if (key) return emb[key] as EventDetailsDTO[];
    }
  }
  return [];
}

function parseSponsorList(data: unknown): EventSponsorsDTO[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as EventSponsorsDTO[];
  }
  return [];
}

function WhatWeDoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`mh-section mh-services${visible ? ' mh-services--in' : ''}`}
      aria-label="What we do"
    >
      <span className="mh-eyebrow mh-services-eyebrow">What we do</span>
      <h2 className="mh-h2 mh-services-heading">Cultural workshops and educational events</h2>
      <div className="mh-services-grid">
        {SERVICES.map((s, index) => (
          <article
            key={s.num}
            className="mh-service-card"
            style={{ ['--mh-stagger' as string]: String(index) }}
          >
            <div className="mh-service-card-accent" aria-hidden />
            <div className="mh-service-card-top">
              <span className="mh-dot" aria-hidden />
              <p className="mh-services-num">{s.num}</p>
            </div>
            <h3 className="mh-services-title">{s.title}</h3>
            <p className="mh-services-desc">{s.description}</p>
            <span className="mh-service-card-rule" aria-hidden />
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ModernistHomePage({
  initialFeaturedEvents,
}: {
  initialFeaturedEvents: FeaturedEventWithMedia[];
}) {
  const {
    showEventsSection,
    showExecutiveCommitteeSection,
    showSponsorsSection,
  } = useTenantSettings();

  const [upcoming, setUpcoming] = useState<EventDetailsDTO[]>([]);
  const [team, setTeam] = useState<ExecutiveCommitteeTeamMemberDTO[]>([]);
  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const featured = initialFeaturedEvents[0] ?? null;
  const featuredEvent = featured?.event ?? upcoming[0] ?? null;
  const featuredImage = featured?.media?.fileUrl || FALLBACK_POSTER;
  const featuredImageIsLocal = featuredImage.startsWith('/');

  const onSaleEvent =
    upcoming.find((e) => admissionLabel(e) === 'Ticketed') ||
    featuredEvent ||
    upcoming[0] ||
    null;

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setEventsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'tenantId.equals': tenantId,
          sort: 'startDate,asc',
          page: '0',
          size: '8',
          'startDate.greaterThanOrEqual': today,
          'isActive.equals': 'true',
        });
        const res = await fetch(`/api/proxy/event-details?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('events fetch failed');
        const data = await res.json();
        if (!cancelled) setUpcoming(parseEventList(data).slice(0, 6));
      } catch (err) {
        console.error('[ModernistHomePage] upcoming events:', err);
        if (!cancelled) setUpcoming([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }

    if (showEventsSection !== false) {
      loadEvents();
    } else {
      setEventsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [showEventsSection]);

  useEffect(() => {
    let cancelled = false;
    if (showExecutiveCommitteeSection === false) return;

    async function loadTeam() {
      try {
        const res = await fetch(
          '/api/proxy/executive-committee-team-members?isActive.equals=true&sort=priorityOrder,asc',
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('team fetch failed');
        const data = await res.json();
        if (!cancelled) {
          setTeam(parseExecutiveCommitteeTeamMembersResponse(data).slice(0, 6));
        }
      } catch (err) {
        console.error('[ModernistHomePage] team:', err);
      }
    }

    loadTeam();
    return () => {
      cancelled = true;
    };
  }, [showExecutiveCommitteeSection]);

  useEffect(() => {
    let cancelled = false;
    if (showSponsorsSection === false) return;

    async function loadSponsors() {
      try {
        const tenantId = getTenantId();
        const params = new URLSearchParams({
          'tenantId.equals': tenantId,
          'isActive.equals': 'true',
          sort: 'priorityRanking,asc',
          size: '12',
        });
        const res = await fetch(`/api/proxy/event-sponsors?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('sponsors fetch failed');
        const data = await res.json();
        if (!cancelled) setSponsors(parseSponsorList(data).slice(0, 8));
      } catch (err) {
        console.error('[ModernistHomePage] sponsors:', err);
      }
    }

    loadSponsors();
    return () => {
      cancelled = true;
    };
  }, [showSponsorsSection]);

  return (
    <main className="modernist-home">
      {/* 1b — Poster hero */}
      <section className="mh-poster-hero" aria-label="Homepage hero">
        <figure className="mh-poster-hero-media mh-grayscale">
          <Image
            src={HERO_IMAGE}
            alt="Kerala backwaters — wooden boat under a coconut tree"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
        <div className="mh-poster-hero-scrim" aria-hidden />
        <div className="mh-poster-hero-content">
          <div className="mh-poster-hero-kicker">
            <span className="mh-dot" aria-hidden />
            <span>Est. New Jersey · Malayali culture, kept alive</span>
          </div>
          <h1>
            <span className="mh-poster-hero-title" style={{ display: 'block' }}>
              Connecting Cultures, Empowering Generations –
            </span>
            <span className="mh-accent-line mh-poster-hero-sub" style={{ display: 'block' }}>
              Celebrating Malayali Roots in the USA.
            </span>
          </h1>
          <p className="mh-poster-hero-lede">
            MCEFEE runs the calendar the community plans its year around. Tickets, registration and
            the whole schedule in one place.
          </p>
          <div className="mh-cta-row">
            <Link href="/events" className="mh-btn mh-btn-primary">
              Browse all events
            </Link>
            <GivebutterDonateButton className="mh-btn mh-btn-on-dark">Donate</GivebutterDonateButton>
          </div>
        </div>
      </section>

      {/* 1b — Red on-sale band */}
      {onSaleEvent && (
        <section className="mh-onsale-band" aria-label="On sale now">
          <h2>
            On sale now — {onSaleEvent.title}
            {onSaleEvent.location ? `, ${onSaleEvent.location}` : ''}
            {onSaleEvent.startDate ? `, ${formatEventDate(onSaleEvent.startDate, onSaleEvent.timezone)}` : ''}
          </h2>
          <Link href={eventHref(onSaleEvent)} className="mh-btn mh-btn-on-dark">
            Get tickets
          </Link>
        </section>
      )}

      {/* Legacy hero slider — same tenant homepage-hero rules as admin settings */}
      <div className="home-hero-viewport-filler mh-legacy-hero-slider">
        <HeroSection />
      </div>

      {/* 1a — Upcoming timetable */}
      {showEventsSection !== false && (
        <section className="mh-section" aria-label="Upcoming events">
          <div className="mh-section-head">
            <span className="mh-eyebrow">Upcoming events</span>
            <Link href="/events" className="mh-link">
              View all events →
            </Link>
          </div>
          <h2 className="mh-h2">The next six dates</h2>

          {eventsLoading ? (
            <p className="mh-empty">Loading events…</p>
          ) : upcoming.length === 0 ? (
            <p className="mh-empty">No upcoming events right now. Check back soon.</p>
          ) : (
            <div className="mh-timetable">
              {upcoming.map((ev) => {
                const label = admissionLabel(ev);
                return (
                  <Link key={ev.id ?? ev.title} href={eventHref(ev)} className="mh-timetable-row">
                    <p className="mh-timetable-date">
                      {formatEventDate(ev.startDate, ev.timezone)}
                    </p>
                    <div>
                      <h3 className="mh-timetable-title">{ev.title}</h3>
                      {(ev.caption || ev.description) && (
                        <p className="mh-timetable-caption">
                          {ev.caption || ev.description}
                        </p>
                      )}
                    </div>
                    <p className="mh-timetable-meta">{ev.location || '—'}</p>
                    <p className="mh-timetable-meta">
                      {formatTimeRange(ev.startTime, ev.endTime)}
                    </p>
                    <div className="mh-timetable-tag">
                      <span className={admissionTagClass(label)}>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 1a — Featured event */}
      {featuredEvent && (
        <section className="mh-featured" aria-label="Featured event">
          <figure className="mh-featured-media mh-grayscale">
            {featuredImageIsLocal ? (
              <Image
                src={featuredImage}
                alt={featuredEvent.title}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                style={{ objectFit: 'contain', objectPosition: 'center center' }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImage}
                alt={featuredEvent.title}
                style={{ objectFit: 'contain', objectPosition: 'center center' }}
              />
            )}
          </figure>
          <div className="mh-featured-body">
            <div className="mh-featured-kicker">
              <span className="mh-dot" aria-hidden />
              <span className="mh-eyebrow" style={{ margin: 0 }}>
                Featured event
              </span>
            </div>
            <h2>{featuredEvent.title}</h2>
            {(featuredEvent.caption || featuredEvent.description) && (
              <p className="mh-featured-lede">
                {featuredEvent.caption || featuredEvent.description}
              </p>
            )}
            <div className="mh-featured-meta">
              <div className="mh-featured-meta-row">
                <span className="mh-featured-meta-label">Date</span>
                <span className="mh-featured-meta-value">
                  {formatEventDate(featuredEvent.startDate, featuredEvent.timezone)}
                </span>
              </div>
              <div className="mh-featured-meta-row">
                <span className="mh-featured-meta-label">Time</span>
                <span className="mh-featured-meta-value">
                  {formatTimeRange(featuredEvent.startTime, featuredEvent.endTime)}
                </span>
              </div>
              <div className="mh-featured-meta-row">
                <span className="mh-featured-meta-label">Venue</span>
                <span className="mh-featured-meta-value">
                  {featuredEvent.location || '—'}
                </span>
              </div>
              <div className="mh-featured-meta-row">
                <span className="mh-featured-meta-label">Admission</span>
                <span className="mh-featured-meta-value">
                  {admissionLabel(featuredEvent)}
                </span>
              </div>
            </div>
            <div className="mh-featured-actions">
              <Link href={eventHref(featuredEvent)} className="mh-btn mh-btn-primary">
                {admissionLabel(featuredEvent) === 'Free' ? 'Register' : 'Get tickets'}
              </Link>
              <Link href="/events" className="mh-btn mh-btn-secondary">
                View calendar
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 1a — What we do (interactive cards) */}
      <WhatWeDoSection />

      {/* 1a — About */}
      <section className="mh-about" aria-label="About the foundation">
        <div>
          <span className="mh-eyebrow" style={{ marginBottom: 14 }}>
            About the foundation
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
              New Jersey, USA ·{' '}
              <a href="tel:+19085168781">(908) 516-8781</a> ·{' '}
              <a href="mailto:Contactus@mcefee.org">Contactus@mcefee.org</a>
            </p>
          </div>
        </div>
      </section>

      {/* 1a — Team */}
      {showExecutiveCommitteeSection !== false && (
        <section
          id="team-section"
          className="mh-section"
          aria-label="Executive committee"
          style={{ paddingTop: 84, paddingBottom: 84 }}
        >
          <h2 className="mh-h2" style={{ marginBottom: 16 }}>
            The people who run the year
          </h2>
          <p
            style={{
              margin: '0 0 48px',
              fontSize: 14,
              lineHeight: '24px',
              color: 'var(--mh-accent-700)',
              maxWidth: '60ch',
            }}
          >
            Committee members from the executive committee — keep the calendar moving.
          </p>
          {team.length === 0 ? (
            <p className="mh-empty">Team members will appear here when available.</p>
          ) : (
            <div className="mh-team-grid">
              {team.map((m) => {
                const name = [m.firstName, m.lastName].filter(Boolean).join(' ') || m.title;
                return (
                  <div key={m.id ?? name} className="mh-team-card">
                    <figure className="mh-team-photo mh-grayscale">
                      {m.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.profileImageUrl} alt={name} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: 'var(--mh-neutral-300)',
                          }}
                          aria-hidden
                        />
                      )}
                    </figure>
                    <h3 className="mh-team-name">{name}</h3>
                    <p className="mh-team-title">
                      {m.designation?.trim() || m.title?.trim() || '—'}
                    </p>
                    {(m.bio || m.expertise) && (
                      <p className="mh-team-bio">{m.expertise || m.bio}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 1a — Sponsors */}
      {showSponsorsSection !== false && (
        <section
          className="mh-section mh-section-tight-top"
          aria-label="Sponsors"
          style={{ paddingBottom: 84 }}
        >
          <div
            className="mh-section-head"
            style={{
              paddingTop: 42,
              borderTop: '2px solid var(--mh-divider)',
              marginBottom: 32,
            }}
          >
            <span className="mh-eyebrow">Sponsors</span>
            <Link href="/sponsors" className="mh-link">
              See all sponsors →
            </Link>
          </div>
          {sponsors.length === 0 ? (
            <p className="mh-empty">Sponsors will appear here when available.</p>
          ) : (
            <div className="mh-sponsors-list">
              {sponsors.map((sp) => (
                <div key={sp.id ?? sp.name} className="mh-sponsor-row">
                  <p className="mh-sponsor-tier">{sp.type || 'Sponsor'}</p>
                  <h3 className="mh-sponsor-name">{sp.companyName || sp.name}</h3>
                  {sp.websiteUrl ? (
                    <a
                      href={sp.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mh-link mh-sponsor-visit"
                    >
                      Visit →
                    </a>
                  ) : (
                    <span className="mh-sponsor-visit" />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 1a — Red CTA close */}
      <section className="mh-close" aria-label="Call to action">
        <h3>
          <span style={{ display: 'block' }}>Save your seat at the sadhya.</span>
        </h3>
        <div className="mh-cta-row">
          <Link
            href={featuredEvent ? eventHref(featuredEvent) : '/events'}
            className="mh-btn mh-btn-on-dark"
          >
            {featuredEvent ? `Get tickets for ${featuredEvent.title}` : 'Browse events'}
          </Link>
          <GivebutterDonateButton className="mh-btn mh-btn-on-dark">Donate</GivebutterDonateButton>
        </div>
      </section>
    </main>
  );
}
