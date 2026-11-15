import { getAppUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { DiscountCodeDTO } from '@/types';

export async function fetchDiscountCodeByIdServer(
  id: number
): Promise<DiscountCodeDTO | null> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/discount-codes/${id}`;

  const response = await fetchWithJwtRetry(url, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    if (response.status !== 404) {
      console.error(
        `[ Server ] Failed to fetch discount code ${id} via proxy:`,
        response.status,
        await response.text()
      );
    }
    return null;
  }
  return response.json();
}
