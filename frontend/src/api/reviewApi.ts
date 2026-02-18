import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';
import type { Review, ReviewStats, AISummaryData } from '../types/review';

const API_BASE_URL = env.API_URL;

class ReviewAPI {
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
            throw new Error(error.detail || error.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async getStats(days: number = 30): Promise<ReviewStats> {
        return this.request(`/reviews/stats?days=${days}`);
    }

    async getReviews(params: {
        page?: number;
        limit?: number;
        search?: string;
        source?: string;
    } = {}): Promise<{ reviews: Review[]; total: number; isPaid: boolean }> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.source) queryParams.append('source', params.source);

        const queryString = queryParams.toString();
        const endpoint = `/reviews/list${queryString ? `?${queryString}` : ''}`;

        const data = await this.request(endpoint);
        return {
            reviews: data.reviews || [],
            total: data.total || 0,
            isPaid: data.isPaid || false,
        };
    }

    async getAISummary(): Promise<AISummaryData> {
        return this.request('/reviews/summary');
    }

    async regenerateSummary(): Promise<AISummaryData> {
        return this.request('/reviews/summary/regenerate', { method: 'POST' });
    }

    async postResponse(reviewId: string, text: string): Promise<{ success: boolean }> {
        return this.request(`/reviews/${reviewId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }

    async syncReviews(): Promise<{ success: boolean; synced: number; message: string }> {
        return this.request('/reviews/sync', { method: 'POST' });
    }
}

export const reviewApi = new ReviewAPI();
