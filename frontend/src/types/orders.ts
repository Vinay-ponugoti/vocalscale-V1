// Shared types and config for the Orders feature

export type OrderStatus = 'confirmed' | 'cancelled';

export interface OrderWithMeta {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    product_name: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
    flavor?: string;
    special_instructions?: string;
    status: OrderStatus;
    pickup_time?: string;
    created_at: string;
    totalAmount: number;
}

export const statusConfig = {
    confirmed: {
        label: 'Confirmed',
        dotColor: 'bg-green-500',
        pillBg: 'bg-green-50 text-green-700 ring-1 ring-green-100',
    },
    cancelled: {
        label: 'Cancelled',
        dotColor: 'bg-red-500',
        pillBg: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    },
};
