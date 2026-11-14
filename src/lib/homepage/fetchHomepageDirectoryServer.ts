import { getApiBaseUrl, getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { logServerFetchFailure } from '@/lib/logServerFetchFailure';
import { normalizeEventDetailsList } from '@/lib/homepage/homepageApiNormalize';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import type { EventSponsorsDTO, EventWithMedia, ExecutiveCommitteeTeamMemberDTO } from '@/types';

export type HomepageListing = {
  events: EventWithMedia[];
  isUpcoming: boolean;
};

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function parseSponsorList(data: unknown): EventSponsorsDTO[] {
  if (Array.isArray(data)) return data as EventSponsorsDTO[];
  if (data && typeof data === 'object' && Array.isArray((data as { content?: unknown }).content)) {
    return (data as { content: EventSponsorsDTO[] }).content;
  }
  return [];
}

async function fetchEventPage(params: URLSearchParams): Promise<EventWithMedia[]> {
  const res = await fetchWithJwtRetry(
    `${getApiBaseUrl()}/api/event-details?${params.toString()}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  return normalizeEventDetailsList(await res.json()).map((event) => ({
    ...event,
    startTime: event.startTime || '',
    endTime: event.endTime || '',
  }));
}

/**
 * Events still running or not yet started, otherwise the most recent past events.
 * Included in the first HTML response so a crawler sees the published calendar.
 */
export async function fetchHomepageListingEventsServer(): Promise<HomepageListing> {
  try {
    const tenantId = getTenantId();
    const today = todayIsoDate();
    const current = await fetchEventPage(
      new URLSearchParams({
        'tenantId.equals': tenantId,
        sort: 'startDate,asc',
        page: '0',
        size: '6',
        'endDate.greaterThanOrEqual': today,
        'isActive.equals': 'true',
      })
    );
    if (current.length > 0) {
      return { events: current, isUpcoming: true };
    }

    const past = await fetchEventPage(
      new URLSearchParams({
        'tenantId.equals': tenantId,
        sort: 'startDate,desc',
        page: '0',
        size: '6',
        'endDate.lessThan': today,
        'isActive.equals': 'true',
      })
    );
    return { events: past, isUpcoming: false };
  } catch (error) {
    logServerFetchFailure('fetchHomepageListingEventsServer', error);
    return { events: [], isUpcoming: true };
  }
}

export async function fetchHomepageTeamServer(): Promise<ExecutiveCommitteeTeamMemberDTO[]> {
  try {
    const params = new URLSearchParams({
      'isActive.equals': 'true',
      sort: 'priorityOrder,asc',
      size: '6',
      'tenantId.equals': getTenantId(),
    });
    const res = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/executive-committee-team-members?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return parseExecutiveCommitteeTeamMembersResponse(await res.json()).slice(0, 6);
  } catch (error) {
    logServerFetchFailure('fetchHomepageTeamServer', error);
    return [];
  }
}

export async function fetchHomepageSponsorsServer(): Promise<EventSponsorsDTO[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      'isActive.equals': 'true',
      sort: 'priorityRanking,asc',
      size: '8',
    });
    const res = await fetchWithJwtRetry(
      `${getApiBaseUrl()}/api/event-sponsors?${params.toString()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return parseSponsorList(await res.json()).slice(0, 8);
  } catch (error) {
    logServerFetchFailure('fetchHomepageSponsorsServer', error);
    return [];
  }
}
