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

export interface OrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    size: number;
}

export interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    ready: number;
    picked_up: number;
    cancelled: number;
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

    async getOrders(page: number = 1, size: number = 20, status?: string): Promise<OrdersResponse> {
        let query = `/orders?page=${page}&size=${size}`;
        if (status) query += `&status=${status}`;
        const data = await this.request(query);
        // Normalize response — backend may return { orders: [...] }, { items: [...] }, or raw array
        if (Array.isArray(data)) {
            return { orders: data, total: data.length, page, size };
        }
        return {
            orders: data.orders || data.items || [],
            total: data.total ?? (data.orders || data.items || []).length,
            page: data.page ?? page,
            size: data.size ?? size,
        };
    }

    async updateOrderStatus(orderId: string, status: string) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getOrderStats(): Promise<OrderStats> {
        return this.request('/orders/stats');
    }
}

export const ordersApi = new OrdersAPI();
