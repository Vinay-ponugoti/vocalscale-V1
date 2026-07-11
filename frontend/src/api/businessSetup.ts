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


  // Upload Knowledge Document for processing (calls Python knowledge processor directly).
  // Uses XMLHttpRequest so we can report real upload progress (fetch can't).
  async uploadKnowledgeDocument(
    file: File,
    onProgress?: (fraction: number) => void,
    agentId?: string | null,
  ): Promise<{ status: string; filename: string; user_id: string; processing_status: string; message: string }> {
    const url = `${env.KNOWLEDGE_API_URL}/upload${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ''}`;
    const headers = await getAuthHeader();

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      // Apply auth headers (do NOT set Content-Type — the browser sets the multipart boundary).
      Object.entries(headers).forEach(([k, v]) => {
        if (v != null) xhr.setRequestHeader(k, String(v));
      });

      xhr.upload.onprogress = (e) => {
        if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(1);
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ status: 'ok', filename: file.name, user_id: '', processing_status: 'processing', message: '' });
          }
        } else {
          let detail = `HTTP ${xhr.status}: ${xhr.statusText}`;
          try {
            detail = JSON.parse(xhr.responseText).detail || detail;
          } catch {
            /* keep default */
          }
          reject(new Error(detail));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
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
  async getKnowledgeFiles(agentId?: string | null): Promise<Array<{
    id: string;
    filename: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    upload_timestamp: string;
    size_bytes?: number;
    chunk_count?: number;
    fact_count?: number;
    doc_type?: string | null;
    error?: string;
    agent_id?: string | null;
  }>> {
    const url = `${env.KNOWLEDGE_API_URL}/files${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ''}`;
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

  // Semantic search over the user's knowledge — the same retrieval the voice
  // agent uses, so it shows exactly what the AI would answer.
  async searchKnowledge(
    query: string,
    limit = 5,
    agentId?: string | null,
  ): Promise<Array<{ id: string; content: string; score: number; metadata?: Record<string, any> }>> {
    const url = `${env.KNOWLEDGE_API_URL}/search${agentId ? `?agent_id=${encodeURIComponent(agentId)}` : ''}`;
    const headers = await getAuthHeader();
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Search failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
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
