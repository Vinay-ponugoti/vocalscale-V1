import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface Campaign {
  id: string;
  name: string;
  instruction: string;
  status: 'scheduled' | 'running' | 'paused' | 'completed' | 'stopped';
  total_recipients: number;
  created_at: string;
  scheduled_at?: string | null;
  started_at?: string | null;
  counts?: Record<string, number> | null;
}

export interface CallOutcome {
  id: string;
  status?: string;
  sentiment?: string | null;
  duration_seconds?: number;
  summary?: string;
}

export interface CampaignRow {
  id: string;
  campaign_id: string;
  contact_id?: string | null;
  recipient_name: string;
  phone_number: string;
  status: 'queued' | 'calling' | 'called' | 'failed' | 'skipped';
  call_id?: string | null;
  error?: string | null;
  outcome?: CallOutcome;
}

export interface CampaignCreate {
  name: string;
  instruction: string;
  recipients: Array<{ contact_id?: string; name: string; phone: string }>;
  scheduled_at?: string; // RFC3339; omit to send now
}

class CampaignsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeader();
    const response = await fetch(`${env.API_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...headers, ...options.headers },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.detail || error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async create(payload: CampaignCreate): Promise<{ campaign: Campaign; rows: CampaignRow[] }> {
    return this.request('/campaigns', { method: 'POST', body: JSON.stringify(payload) });
  }

  async list(): Promise<Campaign[]> {
    const res = await this.request<{ data: Campaign[] }>('/campaigns');
    return res.data || [];
  }

  async get(id: string): Promise<{ campaign: Campaign; rows: CampaignRow[] }> {
    return this.request(`/campaigns/${id}`);
  }

  async setStatus(id: string, status: Campaign['status']): Promise<void> {
    await this.request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async updateRow(
    rowId: string,
    patch: { status: CampaignRow['status']; call_id?: string; error?: string },
  ): Promise<void> {
    await this.request(`/campaign-calls/${rowId}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
}

export const campaignsAPI = new CampaignsAPI();
