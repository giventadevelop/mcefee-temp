'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getApiBaseUrl } from '@/lib/env';
import type { ManualPaymentRequestDTO } from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

export async function createManualPaymentRequestServer(
  paymentRequest: Omit<ManualPaymentRequestDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ManualPaymentRequestDTO> {
  const url = `${getApiBase()}/api/manual-payments`;

  const { manualPaymentMethodType, ...rest } = paymentRequest;
  const backendPayload: Record<string, unknown> = {
    ...rest,
    paymentMethodType: manualPaymentMethodType,
  };

  const response = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : {};
    } catch {
      errorData = {};
    }

    let userMessage = 'Failed to create payment request. Please try again.';
    const message = typeof errorData.message === 'string' ? errorData.message : '';

    if (response.status === 400) {
      if (message) {
        if (message.includes('paymentMethodType') || message.includes('payment_method_type')) {
          userMessage = 'Please select a payment method.';
        } else if (message.includes('tenantId') || message.includes('tenant_id')) {
          userMessage = 'An internal error occurred. Please refresh the page and try again.';
        } else if (message.includes('amount') || message.includes('amountDue')) {
          userMessage = 'Please select at least one ticket.';
        } else if (message.includes('validation') || message.includes('Validation')) {
          userMessage = 'Please check all required fields and try again.';
        } else {
          userMessage = message;
        }
      } else if (Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.map((err: { field?: string; defaultMessage?: string; message?: string }) => {
          if (err.field === 'paymentMethodType' || err.field === 'payment_method_type') {
            return 'Please select a payment method.';
          }
          if (err.field === 'tenantId' || err.field === 'tenant_id') {
            return 'An internal error occurred. Please refresh the page and try again.';
          }
          if (err.field === 'amount' || err.field === 'amountDue') {
            return 'Please select at least one ticket.';
          }
          return err.defaultMessage || err.message || 'Please check this field.';
        });
        userMessage = validationErrors.join(' ');
      }
    } else if (response.status === 500) {
      userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
    } else if (response.status === 401 || response.status === 403) {
      userMessage = 'Authentication error. Please refresh the page and try again.';
    } else if (response.status >= 500) {
      userMessage = 'The server is temporarily unavailable. Please try again in a few moments.';
    } else if (message) {
      userMessage = message;
    }

    const error = new Error(userMessage) as Error & { status?: number; errorData?: unknown };
    error.status = response.status;
    error.errorData = errorData;
    throw error;
  }

  const responseData = await response.json();
  if (responseData.paymentMethodType && !responseData.manualPaymentMethodType) {
    responseData.manualPaymentMethodType = responseData.paymentMethodType;
  }
  return responseData;
}

export async function fetchManualPaymentMethodsServer(): Promise<Array<{ providerName: string; enabled: boolean; config?: unknown }>> {
  const url = `${getApiBase()}/api/manual-payment-methods`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payment methods: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
