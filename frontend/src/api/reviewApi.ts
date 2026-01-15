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
        // Use v1 endpoint as per backend implementation
        const endpoint = `/v1/reviews/list${queryString ? `?${queryString}` : ''}`;

        const data = await this.request(endpoint);

        // Map backend DB fields to frontend Review type
        return {
            reviews: (data.reviews || []).map((r: any) => ({
                id: r.id,
                name: r.name || r.customer_name || 'Anonymous',
                initials: this.getInitials(r.name || r.customer_name),
                color: this.getRandomColor(), // Assign a random color for UI
                rating: r.rating || 0,
                time: this.formatTimeAgo(r.review_date || r.created_at),
                text: r.text || r.content || '',
                replied: false, // Default to false as DB schema doesn't have replied column yet
                critical: r.sentiment === 'negative',
                source: 'google_places', // Default source
                original_timestamp: r.review_date
            })),
            total: data.total || 0
        };
    }

    // Helper functions
    private getInitials(name: string): string {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    private getRandomColor() {
        const colors = [
            'bg-blue-50 text-blue-600',
            'bg-green-50 text-green-600',
            'bg-purple-50 text-purple-600',
            'bg-orange-50 text-orange-600',
            'bg-pink-50 text-pink-600',
            'bg-indigo-50 text-indigo-600'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private formatTimeAgo(dateString: string): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
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
