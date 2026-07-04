import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

const API_BASE_URL = env.API_URL;

class CallsAPI {
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
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
        return response.json();
    }

    async getRecentCalls(page: number = 1, size: number = 10) {
        return this.request(`/dashboard/calls?page=${page}&size=${size}`);
    }

    /**
     * Trigger an AI-initiated outbound follow-up call: the agent calls the
     * customer and works toward the given plain-text objective.
     */
    async startOutboundCall(toPhone: string, instruction: string, callerName?: string) {
        const url = `${API_BASE_URL}/calls/outbound`;
        const headers = await getAuthHeader();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ to_phone: toPhone, instruction, caller_name: callerName || '' }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.detail || `HTTP ${response.status}`);
        }
        return data as { call_id: string; status: string };
    }
}

export const callsApi = new CallsAPI();
