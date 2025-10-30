'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { EventDetailsDTO, EventWithMedia } from '@/types';
import { getAppUrl } from '@/lib/env';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';

// Add local extension for placeholder text
interface EventWithMediaExtended extends EventWithMedia {
  placeholderText?: string;
}

// Image rotation logic component with full event flyer implementation
const DynamicHeroImage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShowingDefault, setIsShowingDefault] = useState(true);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<EventWithMediaExtended | null>(null);
  const [hasTicketedEvents, setHasTicketedEvents] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithMediaExtended[]>([]);

  // Use shared data hook for consistent date parsing
  const { filteredEvents, isLoading: eventsLoading, error } = useFilteredEvents('hero');

  // Default image path
  const defaultImage = "/images/hero_section/default_hero_section_second_column_poster.webp";

  // Overlay logic based on current event - Implements priority system from documentation
  const getOverlayForEvent = (event: EventWithMediaExtended | null) => {
    if (!event) return null;

    // Priority 1: Buy Tickets (highest priority)
    if (event.admissionType?.toLowerCase().includes('ticket') ||
      event.admissionType?.toLowerCase().includes('paid') ||
      event.admissionType?.toLowerCase().includes('fee')) {
      return { type: 'tickets', image: '/images/buy_tickets_click_here_red.webp', action: `/events/${event.id}` };
    }

    // Priority 2: Registration Required
    if (event.isRegistrationRequired) {
      return { type: 'registration', image: '/images/register_here_button.png', action: `/events/${event.id}` };
    }

    // Priority 3: Live Event
    if (event.isLive) {
      return { type: 'live', image: '/images/watch_live_button.png', action: `/events/${event.id}` };
    }

    // Priority 4: Sports Event
    if (event.isSportsEvent) {
      return { type: 'sports', image: '/images/sports_event_button.png', action: `/events/${event.id}` };
    }

    return null; // No overlay
  };



  useEffect(() => {
    const initializeHeroImages = async () => {
      try {
        setIsLoading(true);

        // Use shared data hook for consistent date parsing
        if (filteredEvents && filteredEvents.length > 0) {
          console.log('=== HERO IMAGE SELECTION ===');
          console.log(`Found ${filteredEvents.length} hero events from shared hook`);

          let heroImageUrl = defaultImage;
          let nextEvent: EventWithMediaExtended | null = null;

          // Convert filtered events to the expected format
          const upcomingEvents = filteredEvents.map(({ event, media }) => ({
            ...event,
            thumbnailUrl: media.fileUrl,
            media: [media]
          } as EventWithMediaExtended));

          // Store upcoming events for image rotation logic
          setUpcomingEvents(upcomingEvents);

          console.log(`Found ${upcomingEvents.length} upcoming events with isHomePageHeroImage = true`);

          if (upcomingEvents.length > 0) {
            const event = upcomingEvents[0];
            heroImageUrl = event.thumbnailUrl!;
            nextEvent = event;
            console.log(`Using hero image from event: ${event.title} (ID: ${event.id})`);
          }


          // Build dynamic images array with multiple events
          const imageUrls: string[] = [];
          const eventData: EventWithMediaExtended[] = [];

          // Add hero image if it's not the default
          if (heroImageUrl !== defaultImage) {
            imageUrls.push(heroImageUrl);
            if (nextEvent) {
              eventData.push(nextEvent);
            }
          }

          // Add more upcoming events with isHomePageHeroImage = true (up to 3 total)
          const additionalEvents = upcomingEvents
            .filter(event => event.id !== nextEvent?.id)
            .slice(0, 2); // Take up to 2 more events

          additionalEvents.forEach(event => {
            imageUrls.push(event.thumbnailUrl!);
            eventData.push(event);
          });

          // Add fallback to original image
          imageUrls.push("https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F67c8b636de774dd2bb5d7097f5fcc176?format=webp&width=800");

          setDynamicImages(imageUrls);

          // Check if any events have tickets (infer from admissionType or other fields)
          const hasTickets = upcomingEvents.some(event =>
            event.admissionType &&
            (event.admissionType.toLowerCase().includes('ticket') ||
              event.admissionType.toLowerCase().includes('paid') ||
              event.admissionType.toLowerCase().includes('fee'))
          );
          setHasTicketedEvents(hasTickets);

          // Set current event for display - this will be updated during rotation
          if (eventData.length > 0) {
            setCurrentEvent(eventData[0]);
          } else {
            setCurrentEvent(null); // No current event for default/fallback images
          }
        }
      } catch (error) {
        console.error('Failed to initialize hero images:', error);
        // Fallback to original image
        setDynamicImages(["https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F67c8b636de774dd2bb5d7097f5fcc176?format=webp&width=800"]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!eventsLoading && !error) {
      initializeHeroImages();
    }
  }, [filteredEvents, eventsLoading, error]);

  useEffect(() => {
    // Start with default image for 2 seconds (reduced from 4)
    const defaultTimer = setTimeout(() => {
      setIsShowingDefault(false);
    }, 2000);

    // If we have dynamic images, start rotating them
    if (dynamicImages.length > 0) {
      const dynamicTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const newIndex = (prev + 1) % dynamicImages.length;

            // Update current event when image changes - key implementation for overlay sync
            if (newIndex < upcomingEvents.length) {
              // Show event-specific overlay for event images
              setCurrentEvent(upcomingEvents[newIndex]);
            } else {
              // No overlay for fallback/default images
              setCurrentEvent(null);
            }

            return newIndex;
          });
        }, 15000); // Change every 15 seconds

        return () => clearInterval(interval);
      }, 2000); // Start after 2 seconds

      return () => {
        clearTimeout(defaultTimer);
        clearTimeout(dynamicTimer);
      };
    }

    return () => clearTimeout(defaultTimer);
  }, [dynamicImages.length]);

  // Show default image for first 2 seconds
  if (isShowingDefault) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={defaultImage}
          alt="Default Hero Image"
          fill
          className="object-fill w-full h-full cursor-pointer"
          style={{
            filter: 'contrast(1.1) saturate(0.9)'
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onClick={() => {
            // Route to events page for default image
            window.location.href = '/events';
          }}
        />
        {/* No Buy Tickets overlay for default image */}
      </div>
    );
  }

  // Show dynamic images after 2 seconds
  if (dynamicImages.length > 0) {
    const isShowingEventFlyer = currentImageIndex < dynamicImages.length - 1; // Skip the fallback image

    return (
      <div className="relative w-full h-full">
        <Image
          src={dynamicImages[currentImageIndex]}
          alt="Dynamic Hero Image"
          fill
          className="object-fill w-full h-full cursor-pointer"
          style={{
            filter: 'contrast(1.1) saturate(0.9)'
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onClick={() => {
            // If showing event flyer and we have current event, route to specific event
            if (isShowingEventFlyer && currentEvent && currentEvent.id) {
              window.location.href = `/events/${currentEvent.id}`;
            } else {
              // Otherwise route to events page
              window.location.href = '/events';
            }
          }}
        />

        {/* Enhanced Overlay Logic - Priority-based system as per documentation */}
        {(() => {
          const overlay = getOverlayForEvent(currentEvent);
          return overlay && isShowingEventFlyer ? (
            <div className="absolute bottom-4 right-4 z-10">
              <Image
                src={overlay.image}
                alt={`${overlay.type} overlay`}
                width={180}
                height={90}
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to buy tickets image if overlay image is missing
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/buy_tickets_click_here_red.webp';
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click handler
                  window.location.href = overlay.action;
                }}
              />
            </div>
          ) : null;
        })()}

        {/* See All Events Overlay - Bottom Left */}
        {(() => {
          const shouldShowSeeAllEvents = currentEvent && (
            (currentEvent.admissionType?.toLowerCase().includes('ticket') ||
              currentEvent.admissionType?.toLowerCase().includes('paid') ||
              currentEvent.admissionType?.toLowerCase().includes('fee')) ||
            currentEvent.isRegistrationRequired
          );

          return shouldShowSeeAllEvents && isShowingEventFlyer ? (
            <div className="absolute left-4 z-10" style={{ bottom: '-36px' }}>
              <Image
                src="/images/hero_bottom_see_all_events-Photoroom.png"
                alt="See All Events"
                width={240}
                height={120}
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.warn('See All Events overlay image not found');
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click handler
                  window.location.href = '/events';
                }}
              />
            </div>
          ) : null;
        })()}
      </div>
    );
  }

  // Fallback to default image
  return (
    <div className="relative w-full h-full">
      <Image
        src={defaultImage}
        alt="Default Hero Image"
        fill
        className="object-fill w-full h-full cursor-pointer"
        style={{
          filter: 'contrast(1.1) saturate(0.9)'
        }}
        sizes="(max-width: 1024px) 100vw, 50vw"
        onClick={() => {
          // Route to events page for default image
          window.location.href = '/events';
        }}
      />
      {/* No Buy Tickets overlay for fallback image */}
    </div>
  );
};

const HeroSection: React.FC = () => {
  return (
    <>
      <div className="min-h-[37.5vh] bg-white pt-20 pb-0 relative">
        {/* Donate Image - Top Right Corner - Positioned below header to avoid hamburger overlap */}
        <div className="absolute top-28 right-6 z-50 lg:top-28 lg:right-8">
          <div className="bg-transparent p-2 rounded-lg">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800"
              alt="Donate"
              width={120}
              height={60}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-lg"
              onClick={() => {
                // Add donate functionality here
                console.log('Donate button clicked');
                // You can add a link to a donation page or open a modal
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid Layout - Mobile: First column cells side by side, second column below; Desktop: custom columns */}
          <div className="grid gap-8 h-full min-h-[300px]">

            {/* Mobile layout: First column cells in same row */}
            <div className="grid grid-cols-2 gap-4 lg:hidden">
              {/* Cell 1: Logo - Simple image and text */}
              <div className="relative overflow-hidden group min-h-[187px] flex flex-col items-center justify-center p-4">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
                  alt="Malayalees Friends Logo"
                  width={180}
                  height={180}
                  className="mx-auto mb-3"
                  priority
                />
                <h2 className="text-lg font-bold text-gray-800 text-center">
                  Malayalees Friends
                </h2>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  Cultural Events Federation
                </p>
              </div>

              {/* Cell 3: Unite India Image - No text overlay */}
              <div className="relative overflow-hidden group min-h-[187px] rounded-[2rem] bg-white">
                <div
                  className="absolute inset-0 rounded-[2rem] p-2"
                  style={{
                    background: `url('https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F7e04d4cf965b47f9b58322797a9f4ba2?format=webp&width=800') center/contain`,
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                ></div>
              </div>

            </div>

            {/* Cell 2: Large Modern Image - Mobile - Bleed to edges */}
            <div className="relative overflow-hidden group min-h-[300px] lg:hidden -mx-4 sm:-mx-6">
              <DynamicHeroImage />
            </div>

            {/* Desktop layout: Original grid with modifications */}
            <div className="hidden lg:grid lg:grid-cols-[3fr_7fr] gap-8 items-end">

              {/* Cell 1: Logo - Simple image and text */}
              <div className="relative overflow-hidden group h-[262px] flex flex-col items-center justify-center">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
                  alt="Malayalees Friends Logo"
                  width={240}
                  height={240}
                  className="mx-auto mb-4"
                  priority
                />
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  Malayalees Friends
                </h2>
                <p className="text-base text-gray-600 mt-2 text-center">
                  Cultural Events Federation
                </p>
              </div>

              {/* Cell 2: Large Modern Image - Dynamic image rotation */}
              <div className="relative lg:row-span-2 group h-[531px]">
                <DynamicHeroImage />
              </div>

              {/* Cell 3: Unite India Image - No text overlay */}
              <div className="relative overflow-hidden group h-[262px] rounded-[2rem] bg-white">
                <div
                  className="absolute inset-0 rounded-[2rem] p-4"
                  style={{
                    background: `url('https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2F7e04d4cf965b47f9b58322797a9f4ba2?format=webp&width=800') center/contain`,
                    backgroundRepeat: 'no-repeat',
                    filter: 'brightness(0.9) contrast(1.1)'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default HeroSection;