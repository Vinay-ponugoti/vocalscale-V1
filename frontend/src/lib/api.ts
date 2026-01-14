import { env } from '../config/env';
import { getAuthToken } from '../utils/sessionUtils';
import { metrics } from './metrics';

const API_BASE = env.API_URL;

export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = getAuthToken();
  
  // Debug: Log token retrieval
  console.log(`DEBUG: getAuthHeader - token exists: ${!!token}, token length: ${token?.length || 0}`);

  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'ngrok-skip-browser-warning': 'true'
  };
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();

  if (init.signal) {
    if (init.signal.aborted) {
      return Promise.reject(new Error('Request was already aborted'));
    }
    init.signal.addEventListener('abort', () => controller.abort());
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = typeof input === 'string' ? input : input.toString();
  const startTime = performance.now();

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    const durationMs = performance.now() - startTime;

    clearTimeout(timeoutId);

    // Track metrics for all API calls
    if (url.startsWith(API_BASE)) {
      const endpoint = url.replace(API_BASE, '');
      metrics.trackApiLatency(endpoint, init.method || 'GET', response.status, durationMs / 1000);
    }

    if (!response.ok) {
      // Don't consume the body here, let the caller handle it if they want
      // but we should log it for debugging
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error(`[API Error Response Body]:`, text.substring(0, 500));
      } catch {
        console.error('[API Error] Could not clone response for logging');
      }
      return response;
    }

    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[API Error] Expected JSON but got:', text.substring(0, 200));
      throw new Error(`API returned non-JSON response (${contentType || 'no content type'})`);
    }

    return response;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    console.error(`[API Network Error] ${url}`, e);
    throw e;
  }
}

export const api = {
  async uploadVoice(file: File | Blob) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voice/upload`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    }, 120000);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
    }
    return response.json(); // { url: string }
  },

  async processVoice(voiceSampleUrl: string) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voice/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ voice_sample_url: voiceSampleUrl }),
    }, 30000);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Processing failed');
    }
    return response.json(); // { audio_url: string | null, clone_id: string, status: string }
  },

  async getVoiceStatus(cloneId: string) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voice/status/${cloneId}`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to get voice status');
    return response.json(); // { id: string, status: string, sample_url: string | null }
  },

  async getProfile() {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/profile`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  async updateProfile(updates: Record<string, unknown>) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(updates),
    }, 30000);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update profile');
    }
    return response.json();
  },

  async synthesize(text: string, voiceSampleUrl: string) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        text,
        voice_sample_url: voiceSampleUrl
      }),
    }, 120000);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API returned ${response.status}`);
    }
    return response.json();
  },

  // --- Voice Settings API ---

  async getVoices() {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voices`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to fetch voices');
    return response.json(); // { data: Voice[], count: number }
  },

  async getVoiceSettings() {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voice-settings`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to fetch voice settings');
    return response.json(); // VoiceSettings
  },

  async updateVoiceSettings(updates: Record<string, unknown>) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/voice-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(updates),
    }, 30000);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update voice settings');
    }
    return response.json();
  },

  // --- Business Setup API ---

  async getBusinessSetup() {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/business-setup`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to fetch business setup');
    return response.json();
  },

  async updateBusinessSetup(updates: Record<string, unknown>) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/business-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(updates),
    }, 30000);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update business setup');
    }
    return response.json();
  },

  async updateNotificationSettings(settings: Record<string, unknown>) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/notification-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(settings),
    }, 30000);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update notification settings');
    }
    return response.json();
  },

  async getBookingRequirements() {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/booking-requirements`, {
      headers,
    }, 15000);
    if (!response.ok) throw new Error('Failed to fetch booking requirements');
    return response.json(); // { data: BookingRequirement[], count: number }
  },

  async updateBookingRequirements(requirements: Array<{ field_name: string; required: boolean; field_type: string; description?: string; status?: 'optional' | 'recommended' | 'required' }>) {
    const headers = await getAuthHeader();
    const response = await fetchWithTimeout(`${API_BASE}/booking-requirements`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(requirements),
    }, 30000);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to update booking requirements');
    }
    return response.json();
  }
};
