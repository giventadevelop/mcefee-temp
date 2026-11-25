import { useState, useEffect, useCallback } from 'react';
import { useSilentListingRefresh } from '@/hooks/useSilentListingRefresh';
import type { EventDetailsDTO, EventMediaDTO } from '@/types';
import { getTenantId } from '@/lib/env';
import { proxyApiPath } from '@/lib/proxyApiPath';
import { isCurrentHomepageEvent } from '@/lib/homepage/featuredEvents';

export interface EventWithMedia {
  event: EventDetailsDTO;
  media: EventMediaDTO[];
}

export interface EventsData {
  events: EventDetailsDTO[];
  eventsWithMedia: EventWithMedia[];
  upcomingEvents: EventDetailsDTO[];
  isLoading: boolean;
  error: string | null;
}

export const useEventsData = (enabled: boolean = true) => {
  const [data, setData] = useState<EventsData>({
    events: [],
    eventsWithMedia: [],
    upcomingEvents: [],
    isLoading: true,
    error: null,
  });

  const fetchEventsData = useCallback(async (silent: boolean, signal?: AbortSignal) => {
    if (!enabled) return;

    try {
      if (!silent) {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
      }

        const tenantId = getTenantId();

        // Fetch events (tenant-scoped for homepage)
        let eventsResponse = await fetch(
          proxyApiPath(
            `/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`
          ),
          { cache: 'no-store', signal }
        );

        if (!eventsResponse.ok) {
          console.log('Events fetch failed with status:', eventsResponse.status);
          // Try fallback
          try {
            eventsResponse = await fetch(
              proxyApiPath(
                `/api/proxy/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`
              ),
              { cache: 'no-store', signal }
            );
            if (!eventsResponse.ok) {
              console.log('Backend unavailable - events not loaded, status:', eventsResponse.status);
              if (silent) return;
              setData({
                events: [],
                eventsWithMedia: [],
                upcomingEvents: [],
                isLoading: false,
                error: null,
              });
              return;
            }
          } catch (fallbackErr) {
            if (signal?.aborted) return;
            console.log('Backend unavailable - events not loaded:', fallbackErr);
            if (silent) return;
            setData({
              events: [],
              eventsWithMedia: [],
              upcomingEvents: [],
              isLoading: false,
              error: null,
            });
            return;
          }
        }

        const events: EventDetailsDTO[] = await eventsResponse.json();
        console.log('Successfully fetched events:', events.length);

        // Current through endDate, plus events that start within the next year.
        const upcomingEvents = events.filter(event => isCurrentHomepageEvent(event));

        console.log('Upcoming events in next 1 year:', upcomingEvents.length);

        // Fetch media for all upcoming events
        const eventsWithMedia: EventWithMedia[] = [];

        console.log('=== FETCHING MEDIA FOR UPCOMING EVENTS ===');
        for (const event of upcomingEvents) {
          console.log(`Fetching media for event ${event.id}: ${event.title}`);
          try {
            const mediaResponse = await fetch(
              proxyApiPath(
                `/api/proxy/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}`
              ),
              { cache: 'no-store', signal }
            );

            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);

              eventsWithMedia.push({
                event,
                media: mediaArray
              });
            } else {
              console.log(`Event ${event.id}: Media fetch failed with status ${mediaResponse.status}`);
              eventsWithMedia.push({
                event,
                media: []
              });
            }
          } catch (mediaError) {
            console.log(`Backend unavailable - media not loaded for event ${event.id}:`, mediaError);
            eventsWithMedia.push({
              event,
              media: []
            });
          }
        }

        console.log('Successfully processed events with media:', eventsWithMedia.length);

        if (signal?.aborted) return;

        setData({
          events,
          eventsWithMedia,
          upcomingEvents,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        if (signal?.aborted) return;
        console.log('Backend connection error - events data not loaded:', error);
        if (silent) return;
        setData({
          events: [],
          eventsWithMedia: [],
          upcomingEvents: [],
          isLoading: false,
          error: null, // Don't set error state, just log it
        });
      }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void fetchEventsData(false);
  }, [enabled, fetchEventsData]);

  useSilentListingRefresh((signal) => fetchEventsData(true, signal), enabled);

  return data;
};
