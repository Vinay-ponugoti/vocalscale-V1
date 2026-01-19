import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

// Import types directly inline to avoid module issues
interface BusinessDetails {
  business_name: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
  website?: string;
  contact_name?: string;
  timezone?: string;
}

interface BusinessHour {
  id?: string;
  day_of_week: string;
  open_time?: string;
  close_time?: string;
  enabled: boolean;
}

interface Service {
  id?: string;
  name: string;
  price?: number;
  description?: string;
}

interface UrgentCallRule {
  id?: string;
  condition_text: string;
  action: string;
  contact?: string;
}

interface BookingRequirement {
  id?: string;
  field_name: string;
  required: boolean;
  field_type: string;
}

interface BusinessSetupData {
  business: BusinessDetails;
  business_hours?: BusinessHour[];
  services?: Service[];
  urgent_call_rules?: UrgentCallRule[];
  booking_requirements?: BookingRequirement[];
}

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
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
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

  // Google Places Search
  async searchGooglePlaces(query: string): Promise<any[]> {
    return this.request(`/google-places/search?query=${encodeURIComponent(query)}`);
  }

  // Google Places Details
  async getGooglePlaceDetails(placeId: string): Promise<any> {
    return this.request(`/google-places/details?place_id=${placeId}`);
  }

  // Upload Knowledge Document for processing
  async uploadKnowledgeDocument(file: File): Promise<{ task_id: string; status: string; message: string }> {
    const url = `${API_BASE_URL}/knowledge/upload`;
    const headers = await getAuthHeader();

    const formData = new FormData();
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

  // Get List of Knowledge Files
  async getKnowledgeFiles(): Promise<Array<{
    id: string;
    filename: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    upload_timestamp: string;
    chunks_count?: number;
    error?: string;
  }>> {
    const url = `${API_BASE_URL}/knowledge/files`;
    const headers = await getAuthHeader();

    const response = await fetch(url, {
      headers: { ...headers },
    });

    if (!response.ok) {
      // Fail gracefully (return empty) if endpoint doesn't exist yet or fails
      console.warn('Failed to fetch knowledge files');
      return [];
    }
    return response.json();
  }
}

export const businessSetupAPI = new BusinessSetupAPI();
