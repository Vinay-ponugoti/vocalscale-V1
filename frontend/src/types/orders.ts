// Shared types and config for the Orders feature

export type OrderStatus = 'pending' | 'confirmed';

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
    pending: {
        label: 'Pending',
        dotColor: 'bg-amber-500',
        pillBg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    },
    confirmed: {
        label: 'Confirmed',
        dotColor: 'bg-green-500',
        pillBg: 'bg-green-50 text-green-700 ring-1 ring-green-100',
    },
};
