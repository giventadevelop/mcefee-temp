import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';
import type { EventDetailsDTO } from '@/types';
import {
  computeFeaturedEventsFromMedia,
  isCurrentHomepageEvent,
  isPastHomepageEvent,
  MAX_FEATURED_EVENTS_HOMEPAGE,
  selectHomepageFeaturedEvents,
  type EventWithMedia,
  type FeaturedEventWithMedia,
} from '@/lib/homepage/featuredEvents';
import {
  isTruthyApiFlag,
  normalizeEventDetailsList,
  normalizeEventMediasList,
} from '@/lib/homepage/homepageApiNormalize';

/**
 * Server-only: same pipeline as `useEventsData` + featured filter, for SSR first paint.
 * Fails closed to [] so the home page still renders if the API is down.
 */
export async function fetchFeaturedEventsForHomepageServer(): Promise<FeaturedEventWithMedia[]> {
  try {
    const apiBase = getApiBaseUrl();
    const tenantId = getTenantId();

    let eventsResponse = await fetchWithJwtRetry(
      `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,asc`,
      { cache: 'no-store' }
    );

    if (!eventsResponse.ok) {
      eventsResponse = await fetchWithJwtRetry(
        `${apiBase}/api/event-details?tenantId.equals=${encodeURIComponent(tenantId)}&sort=startDate,desc`,
        { cache: 'no-store' }
      );
    }

    if (!eventsResponse.ok) {
      console.warn('[fetchFeaturedEventsForHomepageServer] event-details failed:', eventsResponse.status);
      return [];
    }

    const events = normalizeEventDetailsList(await eventsResponse.json());

    const isFeaturedEvent = (event: EventDetailsDTO) =>
      isTruthyApiFlag((event as EventDetailsDTO & { is_featured_event?: unknown }).isFeaturedEvent) ||
      isTruthyApiFlag((event as EventDetailsDTO & { is_featured_event?: unknown }).is_featured_event);

    const currentEvents = events.filter((event) => isCurrentHomepageEvent(event));
    const currentFeatured = currentEvents.filter(isFeaturedEvent);

    // Current featured first, including events that already started and have not ended.
    // Past featured only when nothing is still running or upcoming.
    const eventsToLoad =
      currentFeatured.length > 0
        ? currentFeatured
        : currentEvents.length === 0
          ? events.filter(
              (event) => event.isActive !== false && isPastHomepageEvent(event) && isFeaturedEvent(event)
            )
          : [];

    if (eventsToLoad.length === 0) {
      return [];
    }

    const eventsWithMedia: EventWithMedia[] = [];

    for (const event of eventsToLoad) {
      try {
        // Prefer dedicated featured-image media, then fall back to all event media
        let mediaResponse = await fetchWithJwtRetry(
          `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isFeaturedEventImage.equals=true`,
          { cache: 'no-store' }
        );
        let mediaArray = mediaResponse.ok
          ? normalizeEventMediasList(await mediaResponse.json())
          : [];

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHomePageHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok
            ? normalizeEventMediasList(await mediaResponse.json())
            : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&isHeroImage.equals=true`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok
            ? normalizeEventMediasList(await mediaResponse.json())
            : [];
        }

        if (mediaArray.length === 0) {
          mediaResponse = await fetchWithJwtRetry(
            `${apiBase}/api/event-medias?tenantId.equals=${encodeURIComponent(tenantId)}&eventId.equals=${event.id}&size=50`,
            { cache: 'no-store' }
          );
          mediaArray = mediaResponse.ok
            ? normalizeEventMediasList(await mediaResponse.json())
            : [];
        }

        eventsWithMedia.push({ event, media: mediaArray });
      } catch {
        eventsWithMedia.push({ event, media: [] });
      }
    }

    return selectHomepageFeaturedEvents(
      computeFeaturedEventsFromMedia(eventsWithMedia),
      currentEvents.length > 0,
      MAX_FEATURED_EVENTS_HOMEPAGE
    );
  } catch (e) {
    logServerFetchFailure('fetchFeaturedEventsForHomepageServer', e);
    return [];
  }
}
