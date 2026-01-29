import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

const API_BASE_URL = env.PAYMENT_API_URL;

class BillingAPI {
  private controllers = new Map<string, AbortController>();

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await getAuthHeader();
    const method = options.method || 'GET';

    // Only cancel duplicate POST/PUT/DELETE requests, not GET requests
    // Multiple components can safely fetch the same GET endpoint in parallel
    const shouldCancelDuplicates = method !== 'GET';
    const requestKey = `${method}-${endpoint}`;

    let controller: AbortController;

    if (shouldCancelDuplicates) {
      // Abort any previous mutating request for same key
      const existingController = this.controllers.get(requestKey);
      if (existingController) {
        existingController.abort();
      }
      controller = new AbortController();
      this.controllers.set(requestKey, controller);
    } else {
      // For GET requests, create a standalone controller (no cancellation)
      controller = new AbortController();
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
      credentials: 'include', // Required for cross-origin requests with authentication
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);

      // Clean up controller after response (only for tracked requests)
      if (shouldCancelDuplicates) {
        this.controllers.delete(requestKey);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // Don't log or rethrow abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      throw error;
    }
  }

  async getPlans() {
    return this.request('/subscription/plans');
  }

  async getSubscription() {
    return this.request('/subscription/status');
  }

  async getUsage() {
    return this.request('/subscription/usage');
  }

  async getInvoices(page = 1, size = 10) {
    return this.request(`/billing/invoices?page=${page}&size=${size}`);
  }

  async getPaymentMethod() {
    return this.request('/billing/payment-method');
  }

  async createCheckoutSession(priceId: string, userEmail?: string) {
    return this.request('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId, user_email: userEmail || '' }),
    });
  }

  // Cancel all pending requests (useful on component unmount)
  cancelAll() {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }

  // Cancel specific request
  cancelRequest(endpoint: string, method = 'GET') {
    const key = `${method}-${endpoint}`;
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }
}

export const billingApi = new BillingAPI();
