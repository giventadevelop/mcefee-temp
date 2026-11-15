import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

export async function fetchEventDetailsByIdServer(eventId: number) {
  if (!eventId) return null;
  const tenantId = getTenantId();
  const res = await fetchWithJwtRetry(
    `${getApiBaseUrl()}/api/event-details/${eventId}?tenantId.equals=${tenantId}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    console.error(`Failed to fetch event details for event ${eventId}: ${res.statusText}`);
    return null;
  }
  return await res.json();
}
