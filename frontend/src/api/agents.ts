import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export type AgentType = 'front_desk' | 'sales' | 'support' | 'after_hours' | 'appointment_setter' | 'custom';

export interface AgentContextDocument {
  id: string;
  agent_id: string;
  business_id: string;
  user_id: string;
  doc_type: string;
  filename: string;
  title?: string;
  content: string;
  content_hash: string;
  ingest_status: 'pending' | 'ingesting' | 'ready' | 'error' | 'skipped';
  ingest_error?: string | null;
  updated_at?: string;
}

export interface Agent {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  description?: string;
  agent_type: AgentType;
  persona?: string;
  voice_id?: string | null;
  tone: 'professional' | 'friendly' | 'casual';
  language: string;
  speaking_speed: number;
  greeting?: string;
  tools: string[];
  booking_required: string[];
  is_default: boolean;
  is_active: boolean;
  updated_at?: string;
  context_documents?: AgentContextDocument[];
}

export interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  agent_id?: string | null;
  status?: string;
}

type AgentPayload = Partial<Pick<
  Agent,
  | 'name'
  | 'description'
  | 'agent_type'
  | 'persona'
  | 'voice_id'
  | 'tone'
  | 'language'
  | 'speaking_speed'
  | 'greeting'
  | 'tools'
  | 'booking_required'
  | 'is_default'
  | 'is_active'
>>;

class AgentsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeader();
    const response = await fetch(`${env.API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.detail || error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async listAgents(): Promise<Agent[]> {
    const response = await this.request<{ data: Agent[] }>('/agents');
    return response.data || [];
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}`);
  }

  async createAgent(payload: AgentPayload): Promise<Agent> {
    const response = await this.request<Agent[] | Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return Array.isArray(response) ? response[0] : response;
  }

  async updateAgent(id: string, payload: AgentPayload): Promise<Partial<Agent>> {
    return this.request<Partial<Agent>>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAgent(id: string): Promise<void> {
    await this.request(`/agents/${id}`, { method: 'DELETE' });
  }

  async syncContext(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/agents/${id}/context/sync`, { method: 'POST' });
  }

  async listContext(id: string): Promise<AgentContextDocument[]> {
    const response = await this.request<{ data: AgentContextDocument[] }>(`/agents/${id}/context`);
    return response.data || [];
  }

  async assignAgent(id: string, phoneNumberIds: string[]): Promise<{ success: boolean }> {
    return this.request(`/agents/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ phone_number_ids: phoneNumberIds }),
    });
  }

  async listPhoneNumbers(): Promise<PhoneNumber[]> {
    return this.request<PhoneNumber[]>('/phone-numbers');
  }
}

export const agentsAPI = new AgentsAPI();
