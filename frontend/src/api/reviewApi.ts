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
            throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    // Get review stats
    async getStats(days: number = 7): Promise<ReviewStats> {
        return this.request(`/reviews/stats?days=${days}`);
    }

    // Get reviews list
    async getReviews(params: {
        page?: number;
        limit?: number;
        search?: string;
        source?: string;
    } = {}): Promise<{ reviews: Review[]; total: number }> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.source) queryParams.append('source', params.source);

        const queryString = queryParams.toString();
        const endpoint = `/reviews/list${queryString ? `?${queryString}` : ''}`;

        return this.request(endpoint);
    }

    // Get AI Summary
    async getAISummary(): Promise<AISummaryData> {
        return this.request('/reviews/summary');
    }

    // Regenerate AI Summary
    async regenerateSummary(): Promise<AISummaryData> {
        return this.request('/reviews/summary/regenerate', { method: 'POST' });
    }

    // Handlers for responding to reviews (future work)
    async postResponse(reviewId: string, text: string): Promise<{ success: boolean }> {
        return this.request(`/reviews/${reviewId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }
}

export const reviewApi = new ReviewAPI();
