'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl, getTenantId } from '@/lib/env';
import type { EventDetailsDTO, EventMediaDTO, FocusGroupMemberDTO } from '@/types';

type FocusGroupMemberPublic = {
  membershipId: number;
  userProfileId: number;
  role: string;
  status: string;
  displayName: string;
  imageUrl?: string | null;
};

type FocusGroupAssociation = {
  id?: number;
  eventId?: number;
};

type EventFocusGroupRow = {
  id?: number;
  eventId?: number;
  focusGroupId?: number;
  event_id?: number;
  focus_group_id?: number;
};

function normalizeEventFocusGroupsResponse(data: unknown): EventFocusGroupRow[] {
  if (Array.isArray(data)) return data as EventFocusGroupRow[];
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as EventFocusGroupRow[];
    const emb = o._embedded as Record<string, unknown> | undefined;
    if (emb && Array.isArray(emb.eventFocusGroups)) {
      return emb.eventFocusGroups as EventFocusGroupRow[];
    }
  }
  return [];
}

async function fetchLinkedEventIds(baseUrl: string, focusGroupId: number): Promise<number[]> {
  const params = new URLSearchParams({
    'focusGroupId.equals': focusGroupId.toString(),
    size: '500',
  });
  const res = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-focus-groups?${params.toString()}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return normalizeEventFocusGroupsResponse(data)
    .map((a) => a.eventId ?? a.event_id)
    .filter((id): id is number => typeof id === 'number');
}

async function fetchAssociatedEvents(
  focusGroupId: number,
  page: number = 0,
  pageSize: number = 10,
  sort: string = 'startDate,desc',
  showPastEvents?: boolean
): Promise<{ events: EventDetailsDTO[]; totalCount: number }> {
  const baseUrl = getAppUrl();
  const eventIds = await fetchLinkedEventIds(baseUrl, focusGroupId);
  if (eventIds.length === 0) {
    return { events: [], totalCount: 0 };
  }

  const params = new URLSearchParams({
    'id.in': eventIds.join(','),
    page: page.toString(),
    size: pageSize.toString(),
    sort,
  });

  if (showPastEvents !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    if (showPastEvents) {
      params.append('endDate.lessThan', today);
    } else {
      params.append('startDate.greaterThanOrEqual', today);
    }
  }

  const res = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-details?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to fetch associated events:', res.status, errorText);
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }

  const data = await res.json();
  const content = Array.isArray(data)
    ? data
    : (data && Array.isArray((data as { content?: unknown }).content)
      ? (data as { content: EventDetailsDTO[] }).content
      : []);
  let totalCount = Number(res.headers.get('X-Total-Count') || res.headers.get('x-total-count')) || 0;
  if (totalCount === 0 && data && typeof data === 'object' && typeof (data as { totalElements?: number }).totalElements === 'number') {
    totalCount = (data as { totalElements: number }).totalElements;
  }
  if (totalCount === 0) totalCount = content.length;

  return { events: content, totalCount };
}

async function fetchEventFocusGroupsByFocusGroupIdServer(focusGroupId: number): Promise<FocusGroupAssociation[]> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/event-focus-groups?focusGroupId.equals=${focusGroupId}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

async function fetchMediaByEventAndAssociationServer(
  eventId: number,
  eventFocusGroupId: number
): Promise<EventMediaDTO[]> {
  const params = new URLSearchParams({
    'eventId.equals': String(eventId),
    'eventFocusGroupId.equals': String(eventFocusGroupId),
    'isEventManagementOfficialDocument.equals': 'false',
    sort: 'updatedAt,desc',
    'tenantId.equals': getTenantId(),
    page: '0',
    size: '500',
  });
  const url = `${getApiBaseUrl()}/api/event-medias?${params.toString()}`;
  const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

function normalizeMembers(data: unknown): FocusGroupMemberDTO[] {
  if (Array.isArray(data)) return data as FocusGroupMemberDTO[];
  if (data && typeof data === 'object') {
    const o = data as { content?: unknown; _embedded?: { focusGroupMembers?: unknown } };
    if (Array.isArray(o.content)) return o.content as FocusGroupMemberDTO[];
    if (Array.isArray(o._embedded?.focusGroupMembers)) {
      return o._embedded!.focusGroupMembers as FocusGroupMemberDTO[];
    }
  }
  return [];
}

/** Upcoming events linked via event_focus_groups (source of truth). */
export async function fetchFocusGroupEventsServer(
  focusGroupId: number,
  options?: { showPast?: boolean; pageSize?: number }
): Promise<EventDetailsDTO[]> {
  const { events } = await fetchAssociatedEvents(
    focusGroupId,
    0,
    options?.pageSize ?? 24,
    options?.showPast ? 'startDate,desc' : 'startDate,asc',
    options?.showPast === true
  );
  return events;
}

export async function fetchFocusGroupMemberCountServer(focusGroupId: number): Promise<number> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'focusGroupId.equals': String(focusGroupId),
    'status.equals': 'ACTIVE',
    page: '0',
    size: '1',
  });
  const res = await fetch(`${baseUrl}/api/proxy/focus-group-members?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) return 0;
  const total = Number(res.headers.get('x-total-count') || res.headers.get('X-Total-Count') || 0);
  if (total > 0) return total;
  const data = await res.json();
  return normalizeMembers(data).length;
}

export async function fetchFocusGroupMembersPublicServer(
  focusGroupId: number,
  limit = 48
): Promise<FocusGroupMemberPublic[]> {
  const baseUrl = getAppUrl();
  const params = new URLSearchParams({
    'focusGroupId.equals': String(focusGroupId),
    'status.equals': 'ACTIVE',
    page: '0',
    size: String(limit),
    sort: 'createdAt,asc',
  });
  const res = await fetch(`${baseUrl}/api/proxy/focus-group-members?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const members = normalizeMembers(await res.json());

  const out: FocusGroupMemberPublic[] = [];
  for (const m of members) {
    const profileId = Number(m.userProfileId);
    if (!profileId) continue;
    let displayName = 'Member';
    let imageUrl: string | null = null;
    try {
      const pRes = await fetch(`${baseUrl}/api/proxy/user-profiles/${profileId}`, { cache: 'no-store' });
      if (pRes.ok) {
        const p = await pRes.json();
        const first = p?.firstName ?? p?.first_name ?? '';
        const last = p?.lastName ?? p?.last_name ?? '';
        displayName = [first, last].filter(Boolean).join(' ') || p?.email || 'Member';
        imageUrl = p?.imageUrl ?? p?.profileImageUrl ?? null;
      }
    } catch {
      /* keep defaults */
    }
    out.push({
      membershipId: Number(m.id) || 0,
      userProfileId: profileId,
      role: m.role || 'MEMBER',
      status: m.status || 'ACTIVE',
      displayName,
      imageUrl,
    });
  }
  return out;
}

/** Gallery: FG-tagged media + public media from all linked events (upcoming and past). */
export async function fetchFocusGroupGalleryMediaServer(
  focusGroupId: number
): Promise<EventMediaDTO[]> {
  const rawAssociations = await fetchEventFocusGroupsByFocusGroupIdServer(focusGroupId);
  let associations: FocusGroupAssociation[] = [];
  if (Array.isArray(rawAssociations)) {
    associations = rawAssociations;
  } else if (rawAssociations && typeof rawAssociations === 'object') {
    const o = rawAssociations as {
      content?: FocusGroupAssociation[];
      _embedded?: { eventFocusGroups?: FocusGroupAssociation[] };
    };
    if (Array.isArray(o.content)) associations = o.content;
    else if (Array.isArray(o._embedded?.eventFocusGroups)) {
      associations = o._embedded!.eventFocusGroups!;
    } else {
      associations = [rawAssociations as FocusGroupAssociation];
    }
  }

  const byId = new Map<number | string, EventMediaDTO>();
  const pushMedia = (item: EventMediaDTO | null | undefined) => {
    if (!item?.fileUrl) return;
    const type = String(item.eventMediaType || '').toUpperCase();
    // Prefer visual gallery items; skip official docs / pure covers when possible
    if (type.includes('OFFICIAL') || type.includes('DOCUMENT')) return;
    const key = item.id != null ? item.id : item.fileUrl;
    if (!byId.has(key)) byId.set(key, item);
  };

  // 1) Media explicitly tagged to this focus group's event associations
  for (const assoc of associations) {
    const eventId = assoc.eventId;
    const assocId = assoc.id;
    if (!eventId || !assocId) continue;
    const items = await fetchMediaByEventAndAssociationServer(eventId, assocId);
    for (const item of items) pushMedia(item);
  }

  // 2) Public media from all linked events (even if not FG-tagged)
  const linkedEventIds = Array.from(
    new Set(
      associations
        .map((a) => a.eventId)
        .filter((id): id is number => typeof id === 'number' && id > 0)
    )
  );

  // If associations API shape was odd, still try upcoming+past via event_focus_groups helper
  if (linkedEventIds.length === 0) {
    try {
      const { events: allLinked } = await fetchAssociatedEvents(focusGroupId, 0, 50, 'startDate,desc');
      for (const ev of allLinked) {
        if (ev.id) linkedEventIds.push(ev.id);
      }
    } catch {
      /* ignore */
    }
  }

  for (const eventId of linkedEventIds.slice(0, 12)) {
    try {
      const params = new URLSearchParams({
        'eventId.equals': String(eventId),
        'isPublic.equals': 'true',
        'isEventManagementOfficialDocument.equals': 'false',
        sort: 'updatedAt,desc',
        size: '24',
        'tenantId.equals': getTenantId(),
      });
      const res = await fetchWithJwtRetry(
        `${getApiBaseUrl()}/api/event-medias?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      for (const item of items) pushMedia(item);
    } catch {
      /* skip */
    }
  }

  return Array.from(byId.values()).slice(0, 36);
}