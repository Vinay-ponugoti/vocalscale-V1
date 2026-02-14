import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

const API_BASE_URL = env.API_URL; // Uses /api from Gateway

class SupportAPI {
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
            credentials: 'include',
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.error || error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async generateDraft(ticketId: string, history: any[], metadata: any, orderData?: any) {
        return this.request('/admin/draft', {
            method: 'POST',
            body: JSON.stringify({
                ticket_id: ticketId,
                user_id: 'admin_dashboard', // Gateway will override with actual ID from token
                history,
                user_metadata: metadata,
                order_data: orderData
            }),
        });
    }

    async executeAction(action: string, params: any) {
        return this.request('/admin/execute', {
            method: 'POST',
            body: JSON.stringify({
                action,
                params
            }),
        });
    }
}

export const supportApi = new SupportAPI();
