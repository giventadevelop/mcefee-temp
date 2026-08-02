'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { EventMediaSlideshow } from './EventMediaSlideshow';
import type { GalleryEventWithMedia } from '../ApiServerActions';

interface GalleryEventCardProps {
  eventWithMedia: GalleryEventWithMedia;
}

export function GalleryEventCard({ eventWithMedia }: GalleryEventCardProps) {
  const [showSlideshow, setShowSlideshow] = useState(false);
  const { event, media, totalMediaCount } = eventWithMedia;

  const heroImage =
    media.find((m) => m.isHomePageHeroImage) ||
    media.find((m) => m.isHeroImage) ||
    media.find((m) => m.fileUrl);

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Date TBD';
    }
  };

  return (
    <>
      <article className="mh-event-card">
        <figure
          className={`mh-event-card-media ${media.length > 0 ? 'mh-gallery-card-media--clickable' : ''}`}
          onClick={() => {
            if (media.length > 0) setShowSlideshow(true);
          }}
          role={media.length > 0 ? 'button' : undefined}
          tabIndex={media.length > 0 ? 0 : undefined}
          onKeyDown={(e) => {
            if (media.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setShowSlideshow(true);
            }
          }}
          aria-label={media.length > 0 ? 'View Gallery' : undefined}
          title={media.length > 0 ? 'Click to view gallery' : undefined}
        >
          {heroImage?.fileUrl ? (
            <Image
              src={heroImage.fileUrl}
              alt={heroImage.altText || event.title}
              width={1600}
              height={900}
              className="mh-event-card-media-img"
              sizes="100vw"
            />
          ) : (
            <div className="mh-gallery-card-placeholder" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {totalMediaCount > 0 && (
            <span className="mh-event-card-badge">
              {totalMediaCount} {totalMediaCount === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </figure>

        <div className="mh-event-card-body">
          <div className="mh-event-card-meta">
            <span className="mh-event-card-date">{formatEventDate(event.startDate)}</span>
            <span className="mh-event-card-admission">Event gallery</span>
          </div>

          <h3>{event.title}</h3>

          {event.caption && <p className="mh-event-card-caption">{event.caption}</p>}

          <div className="mh-event-card-actions">
            <button
              type="button"
              onClick={() => setShowSlideshow(true)}
              disabled={media.length === 0}
              className="mh-btn mh-btn-details"
              title="View Gallery"
              aria-label="View Gallery"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Gallery
            </button>

            <Link
              href={`/events/${event.id}`}
              className="mh-btn mh-btn-register"
              title="Event Details"
              aria-label="Event Details"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Event Details
            </Link>
          </div>
        </div>
      </article>

      {showSlideshow && (
        <EventMediaSlideshow
          event={event}
          media={media}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </>
  );
}
