import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventContactsDTO } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseUrl = getAppUrl();

export async function fetchEventContactsServer(eventId?: number) {
  const params = new URLSearchParams();
  if (eventId) {
    params.append('eventId.equals', eventId.toString());
  }

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts${params.toString() ? `?${params.toString()}` : ''}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contacts: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event contact: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventContactServer(contact: Omit<EventContactsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const payload = withTenantId(contact);

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event contact: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventContactServer(id: number, contact: Partial<EventContactsDTO>) {
  const payload = withTenantId({ ...contact, id });

  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event contact: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventContactServer(id: number) {
  const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-contacts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event contact: ${errorText}`);
  }

  return true;
}
