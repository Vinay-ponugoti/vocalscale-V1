import {
    RefreshCw,
    Phone,
    Mail,
    Package,
    MessageSquare,
    Hash,
    Calendar,
    X,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { statusConfig, type OrderWithMeta, type OrderStatus } from '@/types/orders';

// --- Status Badge ---
export const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const config = statusConfig[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${config.pillBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
};

// --- Order Detail Slide-over ---
export const OrderDetailPanel = ({
    order,
    open,
    onClose,
    onStatusChange,
    updating,
}: {
    order: OrderWithMeta | null;
    open: boolean;
    onClose: () => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
    updating: boolean;
}) => {
    if (!order || !open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-300 z-50">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Order Details</h2>
                        <p className="text-xs font-mono font-semibold text-indigo-600 mt-0.5">
                            #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Amount & Timeline */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-slate-900">${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ordered</p>
                                <p className="text-sm font-semibold text-slate-600">
                                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Timeline
                        </h4>
                        <div className="space-y-3 relative pl-5 border-l-2 border-slate-100">
                            <div className="relative">
                                <div className="absolute -left-[13px] w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900">Order Placed</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
                                    </p>
                                </div>
                            </div>
                            {order.pickup_time && (
                                <div className="relative">
                                    <div className="absolute -left-[13px] w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                        <p className="text-sm font-semibold text-slate-900">Pickup Scheduled</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {format(new Date(order.pickup_time), 'MMM d, yyyy · h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer</h4>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm ring-1 ring-indigo-500/10">
                                    {order.customer_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{order.customer_name}</p>
                                    <p className="text-xs text-slate-400">
                                        Customer since {format(new Date(order.created_at), 'MMM yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={`tel:${order.customer_phone}`}
                                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center ring-1 ring-blue-500/10">
                                        <Phone size={14} className="text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{order.customer_phone}</span>
                                </a>
                                {order.customer_email && (
                                    <a
                                        href={`mailto:${order.customer_email}`}
                                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center ring-1 ring-purple-500/10">
                                            <Mail size={14} className="text-purple-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">{order.customer_email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Items</h4>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex gap-3">
                                <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                    <Package size={24} className="text-slate-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-slate-900 truncate">{order.product_name}</p>
                                        <p className="font-bold text-slate-900 shrink-0">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-slate-100">
                                            <Hash size={10} />
                                            {order.quantity}x
                                        </span>
                                        {order.flavor && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                                                {order.flavor}
                                            </span>
                                        )}
                                    </div>
                                    {order.unit_price && order.quantity > 1 && (
                                        <p className="text-xs text-slate-400 mt-1.5">${order.unit_price.toFixed(2)} each</p>
                                    )}
                                </div>
                            </div>

                            {order.special_instructions && (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2">
                                    <MessageSquare size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Special Instructions</p>
                                        <p className="text-xs text-amber-800">{order.special_instructions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    <a
                        href={`tel:${order.customer_phone}`}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                    >
                        <Phone size={14} />
                        Call
                    </a>

                    {/* Action Button: Confirmed -> Cancelled, Cancelled -> Confirmed */}
                    {order.status === 'confirmed' ? (
                        <button
                            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                            onClick={() => onStatusChange(order.id, 'cancelled')}
                            disabled={updating}
                        >
                            {updating ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                            Cancel Order
                        </button>
                    ) : (
                        <button
                            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                            onClick={() => onStatusChange(order.id, 'confirmed')}
                            disabled={updating}
                        >
                            {updating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Reactivate Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
