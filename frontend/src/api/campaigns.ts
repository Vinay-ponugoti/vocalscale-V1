import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface Campaign {
  id: string;
  name: string;
  instruction: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'stopped';
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
  status: 'queued' | 'calling' | 'called' | 'failed' | 'skipped' | 'blocked';
  call_id?: string | null;
  error?: string | null;
  blocked_reason?: string | null;
  call_brief?: string | null;
  outcome?: CallOutcome;
}

export interface CampaignProspect {
  id: string;
  business_name: string;
  phone_number: string;
  website?: string;
  city?: string;
  category?: string;
  business_summary?: string;
  consent_status: 'written_obtained' | 'not_obtained' | 'revoked';
  ai_call_eligible: boolean;
  blocked_reason?: string;
}

export interface CampaignImportResult {
  mode: 'preview' | 'commit';
  summary: { total: number; valid: number; invalid: number; duplicates: number; existing: number; committed: number; ai_call_eligible: number; blocked: number };
  rows: Array<{ row: number; prospect: { name: string; phone: string; city?: string; category?: string }; valid: boolean; duplicate: boolean; existing: boolean; ai_call_eligible: boolean; error?: string; blocked_reason?: string }>;
}

export interface CampaignPreview {
  summary: { total: number; ready: number; blocked: number; duplicates: number };
  rows: Array<{ row: number; business_name?: string; phone?: string; ready: boolean; duplicate?: boolean; blocked_reason?: string; call_brief?: string }>;
}

export interface CampaignCreate {
  name: string;
  instruction: string;
  goal?: string;
  offer?: string;
  disclosure_text?: string;
  qualification_criteria?: string[];
  guardrails?: string[];
  recipients: Array<{ contact_id?: string; prospect_id?: string; name: string; phone: string }>;
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

  async preview(payload: CampaignCreate): Promise<CampaignPreview> {
    return this.request('/campaigns/preview', { method: 'POST', body: JSON.stringify(payload) });
  }

  async listProspects(query = ''): Promise<CampaignProspect[]> {
    const res = await this.request<{ data: CampaignProspect[] }>(`/campaign-prospects${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    return res.data || [];
  }

  async importProspects(input: { file?: File; paste?: string; mode: 'preview' | 'commit'; defaultCity?: string; defaultCategory?: string }): Promise<CampaignImportResult> {
    const headers = await getAuthHeader();
    const form = new FormData();
    if (input.file) form.append('file', input.file);
    if (input.paste) form.append('paste', input.paste);
    form.append('mode', input.mode);
    form.append('default_city', input.defaultCity || '');
    form.append('default_category', input.defaultCategory || '');
    const response = await fetch(`${env.API_URL}/campaign-prospects/import`, { method: 'POST', headers, body: form });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async download(path: 'import-template' | 'export', filename: string): Promise<void> {
    const headers = await getAuthHeader();
    const response = await fetch(`${env.API_URL}/campaign-prospects/${path}`, { headers });
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async retry(id: string): Promise<{ retried: number; still_blocked: number; status: string }> {
    return this.request(`/campaigns/${id}/retry`, { method: 'POST' });
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

}

export const campaignsAPI = new CampaignsAPI();
