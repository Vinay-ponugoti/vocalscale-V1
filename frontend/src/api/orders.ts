import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

const API_BASE_URL = env.API_URL;

export interface Order {
    id: string;
    business_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    product_name: string;
    quantity: number;
    flavor?: string;
    status: 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled';
    call_id?: string;
    pickup_time?: string;
    special_instructions?: string;
    created_at: string;
    updated_at: string;
}

class OrdersAPI {
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

    async getOrders(page: number = 1, size: number = 20, status?: string) {
        let query = `/orders?page=${page}&size=${size}`;
        if (status) query += `&status=${status}`;
        return this.request(query);
    }

    async updateOrderStatus(orderId: string, status: string) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getOrderStats() {
        return this.request('/orders/stats');
    }
}

export const ordersApi = new OrdersAPI();
