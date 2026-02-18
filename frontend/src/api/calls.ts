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
}

export const callsApi = new CallsAPI();
