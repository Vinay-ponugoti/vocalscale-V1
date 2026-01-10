import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

const API_BASE_URL = env.PAYMENT_API_URL;

class BillingAPI {
  private controllers = new Map<string, AbortController>();

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await getAuthHeader();
    
    // Create unique request key for cancellation
    const requestKey = `${options.method || 'GET'}-${endpoint}`;
    
    // Abort any previous request for same key
    const existingController = this.controllers.get(requestKey);
    if (existingController) {
      existingController.abort();
    }
    
    // Create new controller for this request
    const controller = new AbortController();
    this.controllers.set(requestKey, controller);
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      
      // Clean up controller after response
      this.controllers.delete(requestKey);
      
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
    return this.request('/billing/usage');
  }

  async getInvoices() {
    return this.request('/billing/invoices');
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
