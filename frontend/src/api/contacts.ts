import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface Contact {
  id: string;
  phone_number: string;
  display_name: string;
  total_calls: number;
  first_call_at: string | null;
  last_call_at: string | null;
  tags: string[];
  preferences?: { notes?: string; [key: string]: unknown } | null;
}

export interface CallMemory {
  id: string;
  summary: string;
  key_topics: string[];
  sentiment: string | null;
  appointment_booked: boolean;
  order_placed: boolean;
  created_at: string | null;
  call_id: string | null;
}

export interface ContactDetail {
  contact: Contact;
  memories: CallMemory[];
}

export interface ContactUpdate {
  display_name?: string;
  tags?: string[];
  notes?: string;
}

export interface ContactCreate {
  phone_number: string;
  display_name?: string;
  tags?: string[];
  notes?: string;
}

class ContactsAPI {
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

  async listContacts(): Promise<Contact[]> {
    const res = await this.request<{ data: Contact[] }>('/contacts');
    return res.data || [];
  }

  async getContact(id: string): Promise<ContactDetail> {
    return this.request<ContactDetail>(`/contacts/${id}`);
  }

  async createContact(payload: ContactCreate): Promise<{ contact: Contact; existed: boolean }> {
    return this.request<{ contact: Contact; existed: boolean }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateContact(id: string, patch: ContactUpdate): Promise<Contact> {
    const res = await this.request<{ contact: Contact }>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return res.contact;
  }
}

export const contactsAPI = new ContactsAPI();
