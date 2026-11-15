import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';

// Imported by client poll components as well as server pages: same-origin in the browser.
const baseUrl = typeof window === 'undefined' ? getAppUrl() : '';

export async function fetchEventPollsServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-polls${qs ? `?${qs}` : ''}`;

    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch polls: ${res.status}`);
    }

    const data = await res.json();
    const totalCount = res.headers.get('x-total-count');

    return {
      data: Array.isArray(data) ? data : [],
      totalCount: totalCount ? parseInt(totalCount, 10) : (Array.isArray(data) ? data.length : 0)
    };
  } catch (error) {
    console.error('Error fetching event polls:', error);
    return { data: [], totalCount: 0 };
  }
}

export async function fetchEventPollServer(pollId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-polls/${pollId}`;

    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poll: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching event poll:', error);
    return null;
  }
}

/** Scheduler uses this to activate/deactivate polls by schedule — not poll CRUD UI. */
export async function updateEventPollServer(pollId: number, pollData: Partial<EventPollDTO>) {
  try {
    const existingPoll = await fetchEventPollServer(pollId);
    if (!existingPoll) {
      throw new Error(`Poll with ID ${pollId} not found`);
    }

    const proxyUrl = `${baseUrl}/api/proxy/event-polls/${pollId}`;

    const res = await fetch(proxyUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({
        ...pollData,
        id: pollId,
        tenantId: existingPoll.tenantId,
        createdAt: existingPoll.createdAt,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update poll: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update poll: ${res.status} - ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error updating event poll:', error);
    throw error;
  }
}

export async function fetchEventPollOptionsServer(filters?: Record<string, any>): Promise<EventPollOptionDTO[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options${qs ? `?${qs}` : ''}`;

    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poll options: ${res.status}`);
    }

    const data = await res.json();
    if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching event poll options:', error);
    return [];
  }
}

export async function fetchEventPollResponsesServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-responses${qs ? `?${qs}` : ''}`;

    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poll responses: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching event poll responses:', error);
    return [];
  }
}

export async function createEventPollResponseServer(responseData: Omit<EventPollResponseDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-responses`;

    const payload = withTenantId({
      comment: responseData.comment,
      responseValue: responseData.responseValue,
      isAnonymous: responseData.isAnonymous,
      poll: responseData.pollId ? { id: responseData.pollId } : undefined,
      pollOption: responseData.pollOptionId ? { id: responseData.pollOptionId } : undefined,
      user: responseData.userId ? { id: responseData.userId } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll response: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll response: ${res.status} - ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error creating event poll response:', error);
    throw error;
  }
}
