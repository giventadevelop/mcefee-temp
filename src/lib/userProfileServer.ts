import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { UserProfileDTO } from '@/types';

/**
 * Service-JWT profile lookup that does not depend on a Clerk session
 * (membership/manage). Profile pages use `fetchUserProfileServer`
 * from `@/app/profile/ApiServerActions` (4-step fallback).
 */

/** Criteria lookup by userId + tenantId (tenant-scoped, consistent response shape). */
export async function fetchAdminProfileServer(userId: string): Promise<UserProfileDTO | null> {
  if (!userId) return null;
  try {
    const params = new URLSearchParams();
    params.append('userId.equals', userId);
    params.append('tenantId.equals', getTenantId());
    params.append('size', '1');
    const url = `${getApiBaseUrl()}/api/user-profiles?${params.toString()}`;

    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0] as UserProfileDTO;
    if (
      data &&
      typeof data === 'object' &&
      'content' in data &&
      Array.isArray((data as { content: unknown }).content)
    ) {
      const content = (data as { content: UserProfileDTO[] }).content;
      return content.length > 0 ? content[0] : null;
    }
    if (data && typeof data === 'object' && 'userId' in data) return data as UserProfileDTO;
    return null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return null;
  }
}
