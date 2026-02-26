import {
    ShoppingBag,
    RefreshCw,
    Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from './OrderDetailPanel';
import type { OrderWithMeta } from '@/types/orders';

interface OrdersTableProps {
    orders: OrderWithMeta[];
    loading: boolean;
    onRowClick: (order: OrderWithMeta) => void;
    page: number;
    total: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const OrdersTable = ({
    orders,
    loading,
    onRowClick,
    page,
    total,
    totalPages,
    pageSize,
    onPageChange,
}: OrdersTableProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 w-[50px]" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-4 bg-slate-100 rounded animate-pulse mb-1" />
                                        <div className="w-20 h-3 bg-slate-50 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4"><div className="w-28 h-4 bg-slate-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4 text-right"><div className="w-14 h-4 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                    <td className="px-6 py-4 hidden md:table-cell"><div className="w-20 h-4 bg-slate-100 rounded animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full animate-pulse" /></td>
                                    <td className="px-6 py-4"><div className="w-6 h-6 bg-slate-50 rounded animate-pulse" /></td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag size={28} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-slate-900 font-semibold mb-1">No orders found</h3>
                                    <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => onRowClick(order)}
                                    className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-indigo-600">
                                            #{order.id.slice(0, 6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{order.customer_name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{order.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{order.product_name}</div>
                                        {order.flavor && (
                                            <div className="text-xs text-slate-400 mt-0.5">{order.flavor}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-slate-900">${order.totalAmount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRowClick(order);
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {orders.length > 0 && (
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        Showing {Math.min(pageSize * (page - 1) + 1, total)}–{Math.min(page * pageSize, total)} of {total}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <PaginationButton onClick={() => onPageChange(1)} disabled={page === 1} title="First page">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
                            </PaginationButton>
                            <PaginationButton onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} title="Previous page">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </PaginationButton>

                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => {
                                    if (totalPages <= 7) return true;
                                    if (p === 1 || p === totalPages) return true;
                                    if (Math.abs(p - page) <= 1) return true;
                                    return false;
                                })
                                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === 'ellipsis' ? (
                                        <span key={`e-${idx}`} className="px-1 text-xs text-slate-300">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => onPageChange(p as number)}
                                            className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${page === p
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <PaginationButton onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} title="Next page">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </PaginationButton>
                            <PaginationButton onClick={() => onPageChange(totalPages)} disabled={page === totalPages} title="Last page">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
                            </PaginationButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Small helper for pagination buttons
const PaginationButton = ({
    onClick,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={title}
    >
        {children}
    </button>
);
