import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  Package,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Eye,
  X,
  Hash,
  Calendar,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 20;

type OrderStatus = 'pending' | 'confirmed';

interface OrderWithMeta extends Order {
  totalAmount: number;
}

// --- Status config ---
const statusConfig = {
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

// --- Status Badge (matches Inventory stock badges) ---
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${config.pillBg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
};

// --- Order Detail Slide-over ---
const OrderDetailPanel = ({
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

  const nextStatus = order.status === 'confirmed' ? 'pending' : 'confirmed';
  const actionLabel = order.status === 'confirmed' ? 'Mark as Pending' : 'Confirm Order';

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
          <button
            className={`ml-auto px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm ${order.status === 'confirmed'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-green-600 hover:bg-green-700'
              }`}
            onClick={() => onStatusChange(order.id, nextStatus)}
            disabled={updating}
          >
            {updating ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : order.status === 'confirmed' ? (
              <Clock size={14} />
            ) : (
              <CheckCircle size={14} />
            )}
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithMeta | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: 'created_at' | 'total_price';
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch orders
  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        ordersApi.getOrders(
          page,
          PAGE_SIZE,
          statusFilter === 'all' ? undefined : statusFilter
        ),
        ordersApi.getOrderStats()
      ]);
      setOrders(ordersRes.orders || []);
      setTotal(ordersRes.total || 0);
      setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Process orders with computed fields
  const processedOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      totalAmount: order.total_price || (order.unit_price || 0) * order.quantity,
    }));
  }, [orders]);

  // Filter and sort orders client-side
  const filteredOrders = useMemo(() => {
    let result = [...processedOrders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_phone.includes(query) ||
        o.product_name.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'total_price') {
        return sortConfig.direction === 'asc'
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
      return 0;
    });

    return result;
  }, [processedOrders, searchQuery, sortConfig]);

  const handleToggleStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingIds(prev => new Set(prev).add(orderId));
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      const newStats = await ordersApi.getOrderStats();
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleRowClick = (order: OrderWithMeta) => {
    setSelectedOrder(order);
    setPanelOpen(true);
  };

  const totalRevenue = stats ? (stats.pending * 25 + stats.confirmed * 25) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage and track all your orders in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 shadow-sm">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Total Orders</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Pending</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Confirmed</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Revenue</p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search customers, phone, or products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {(['all', 'pending', 'confirmed'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => { setStatusFilter(val); setPage(1); }}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${statusFilter === val
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  {val === 'all' ? 'All' : val}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-') as [typeof sortConfig.key, typeof sortConfig.direction];
                  setSortConfig({ key, direction });
                }}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-tight pl-3 pr-8 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="total_price-desc">Price: High to Low</option>
                <option value="total_price-asc">Price: Low to High</option>
              </select>
              <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 mx-auto text-red-500 ring-1 ring-red-500/10">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-slate-900 font-bold text-base tracking-tight mb-1">Something went wrong</h3>
            <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">{error}. Please try again.</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}

        {/* Table */}
        {!error && (
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
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-6 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw size={16} className="animate-spin text-slate-300" />
                            <span className="text-sm text-slate-400">Loading orders...</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
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
                    filteredOrders.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => handleRowClick(order)}
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
                              handleRowClick(order);
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
            {filteredOrders.length > 0 && (
              <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {Math.min(PAGE_SIZE * (page - 1) + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft size={14} />
                    </button>

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
                            onClick={() => setPage(p as number)}
                            className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${page === p
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Panel */}
      <OrderDetailPanel
        order={selectedOrder}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onStatusChange={handleToggleStatus}
        updating={selectedOrder ? updatingIds.has(selectedOrder.id) : false}
      />
    </DashboardLayout>
  );
}