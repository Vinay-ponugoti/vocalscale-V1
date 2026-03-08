import { env } from '../config/env';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuthHeader } from '../lib/api';
import type { BusinessDetails, BusinessHour, Service, UrgentCallRule, BusinessBookingRequirement as BookingRequirement, BusinessSetupData } from '../types/business';

const API_BASE_URL = env.API_URL;

class BusinessSetupAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await getAuthHeader();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let error: any;
      try {
        error = await response.json();
      } catch {
        error = { detail: 'Unknown error' };
      }

      let errorMessage = error.detail || error.error || error.message;
      if (!errorMessage && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }

      throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get complete business setup
  async getBusinessSetup(): Promise<{
    business: BusinessDetails;
    business_hours: BusinessHour[];
    services: Service[];
    urgent_call_rules: UrgentCallRule[];
    booking_requirements: BookingRequirement[];
  }> {
    return this.request('/business');
  }

  // Save complete business setup
  async saveBusinessSetup(data: BusinessSetupData): Promise<{ success: boolean; business_id?: string }> {
    return this.request('/business', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update business details only
  async updateBusinessDetails(data: Partial<BusinessDetails>): Promise<BusinessDetails> {
    return this.request('/business/details', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Update business hours
  async updateBusinessHours(hours: BusinessHour[]): Promise<{ success: boolean }> {
    return this.request('/business/hours', {
      method: 'PUT',
      body: JSON.stringify(hours),
    });
  }

  // Update services
  async updateServices(services: Service[]): Promise<{ success: boolean }> {
    return this.request('/services', {
      method: 'PUT',
      body: JSON.stringify({ services }),
    });
  }

  // Update urgent call rules
  async updateUrgentCallRules(rules: UrgentCallRule[]): Promise<{ success: boolean }> {
    return this.request('/urgent-call-rules', {
      method: 'PUT',
      body: JSON.stringify({ urgent_call_rules: rules }),
    });
  }

  // Update booking requirements
  async updateBookingRequirements(requirements: BookingRequirement[]): Promise<{ success: boolean }> {
    return this.request('/booking-requirements', {
      method: 'PUT',
      body: JSON.stringify({ booking_requirements: requirements }),
    });
  }

  async searchGooglePlaces(query: string): Promise<any[]> {
    return this.request(`/google-places/search?query=${encodeURIComponent(query)}`);
  }

  // Google Places Details
  async getGooglePlaceDetails(placeId: string): Promise<any> {
    return this.request(`/google-places/details?place_id=${placeId}`);
  }


  // Upload Knowledge Document for processing (calls Python knowledge processor directly)
  async uploadKnowledgeDocument(file: File): Promise<{ status: string; filename: string; user_id: string; processing_status: string; message: string }> {
    const url = `${env.KNOWLEDGE_API_URL}/upload`;
    const headers = await getAuthHeader();

    const formData: any = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload Inventory (CSV/Excel) — calls Knowledge Processor directly
  async uploadInventory(formData: FormData): Promise<{ success: boolean; imported: number; message: string }> {
    const url = `${env.KNOWLEDGE_API_URL}/inventory/upload`;
    const headers = await getAuthHeader();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Get Inventory — calls Knowledge Processor directly
  async getInventory(): Promise<{ items: any[] }> {
    const url = `${env.KNOWLEDGE_API_URL}/inventory`;
    const headers = await getAuthHeader();
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Update Inventory Item
  async updateInventoryItem(itemId: string, data: Record<string, any>): Promise<{ success: boolean; item: any }> {
    const url = `${env.KNOWLEDGE_API_URL}/inventory/${itemId}`;
    const headers = await getAuthHeader();
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Update failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Delete Inventory Item
  async deleteInventoryItem(itemId: string): Promise<{ success: boolean }> {
    const url = `${env.KNOWLEDGE_API_URL}/inventory/${itemId}`;
    const headers = await getAuthHeader();
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Delete All Inventory Items
  async deleteAllInventory(): Promise<{ success: boolean; deleted_count: number }> {
    const url = `${env.KNOWLEDGE_API_URL}/inventory`;
    const headers = await getAuthHeader();
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Poll Task Status
  async getTaskStatus(taskId: string): Promise<{ task_id: string; status: string; result?: any }> {
    const url = `${API_BASE_URL}/knowledge/tasks/${taskId}`;
    const headers = await getAuthHeader();

    const response = await fetch(url, {
      headers: { ...headers },
    });

    if (!response.ok) {
      throw new Error('Failed to check task status');
    }

    return response.json();
  }

  // Get List of Knowledge Files (calls Python knowledge processor directly)
  async getKnowledgeFiles(): Promise<Array<{
    id: string;
    filename: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    upload_timestamp: string;
    size_bytes?: number;
    error?: string;
  }>> {
    const url = `${env.KNOWLEDGE_API_URL}/files`;
    const headers = await getAuthHeader();

    const response = await fetch(url, {
      headers: { ...headers },
    });

    if (!response.ok) {
      console.warn('Failed to fetch knowledge files');
      return [];
    }
    const data = await response.json();
    return data.files || [];
  }

  // Delete a Knowledge File
  async deleteKnowledgeFile(fileId: string): Promise<{ success: boolean }> {
    const url = `${env.KNOWLEDGE_API_URL}/files/${fileId}`;
    const headers = await getAuthHeader();
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }
}

export const businessSetupAPI = new BusinessSetupAPI();
