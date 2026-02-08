import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

// Import types directly inline to avoid module issues
interface BusinessDetails {
  id?: string;
  user_id?: string;
  business_name: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
  website?: string;
  contact_name?: string;
  timezone?: string;
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  auto_setup?: boolean;
  image_url?: string;
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
  transfer_number?: string;
  is_enabled?: boolean;
  user_id?: string;
  rule_type?: 'urgent' | 'standard';
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

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
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

  // Save reviews
  async saveReviews(reviews: Review[], businessId: string): Promise<{ status: string; saved: number }> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        business_id: businessId,
        reviews: reviews
      }),
    });
  }

  // Upload Knowledge Document for processing (calls Python knowledge processor directly)
  async uploadKnowledgeDocument(file: File): Promise<{ status: string; filename: string; user_id: string; processing_status: string; message: string }> {
    const url = `${env.KNOWLEDGE_API_URL}/upload`;
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

  // Upload Inventory (CSV/Excel)
  async uploadInventory(formData: FormData): Promise<{ success: boolean; imported: number; message: string }> {
    const url = `${API_BASE_URL}/knowledge/inventory`;
    const headers = await getAuthHeader(); // Remove Content-Type to let browser set boundary

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

  // Get Inventory
  async getInventory(): Promise<{ items: any[] }> {
    const url = `${API_BASE_URL}/knowledge/inventory`;
    const headers = await getAuthHeader();
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
}

export const businessSetupAPI = new BusinessSetupAPI();
