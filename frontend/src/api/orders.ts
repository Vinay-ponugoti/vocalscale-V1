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
    product_sku?: string;
    quantity: number;
    flavor?: string;
    unit_price?: number;
    total_price?: number;
    status: 'confirmed' | 'cancelled';
    call_id?: string;
    call_sid?: string;
    pickup_time?: string;
    special_instructions?: string; // ---
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
    confirmed: number;
    cancelled: number;
    revenue: number;
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
            throw new Error(error.detail || error.error || `HTTP ${response.status}`);
        }
        return response.json();
    }

    async getOrders(page: number = 1, size: number = 20, status?: string): Promise<OrdersResponse> {
        let query = `/orders?page=${page}&size=${size}`;
        if (status) query += `&status=${status}`;
        const data = await this.request(query);
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
        const stats = await this.request('/orders/stats');
        // Merge pending into confirmed for frontend display
        return {
            total: stats.total,
            confirmed: (stats.confirmed || 0) + (stats.pending || 0),
            cancelled: stats.cancelled || 0,
            revenue: stats.revenue || stats.total_revenue || stats.total_amount || 0
        };
    }
}

export const ordersApi = new OrdersAPI();
