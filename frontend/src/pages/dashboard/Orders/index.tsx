import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import {
  ShoppingBag, Search, RefreshCw, Download,
  CheckCircle, Clock, Package, X, Phone, Mail, Calendar,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle, DollarSign, MessageSquare, Hash,
  ArrowUpDown, Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 20;

// --- Status Types ---
// Matches backend constraints: only pending and confirmed are supported.
type OrderStatus = 'pending' | 'confirmed';

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: string }) => {
  const isConfirmed = status === 'confirmed';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isConfirmed
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
        }`} />
      {isConfirmed ? 'Confirmed' : 'Pending'}
    </span>
  );
};

// --- Quick Action Button ---
const QuickActionButton = ({ icon: Icon, label, onClick, className }: { icon: React.ElementType; label: string; onClick: () => void; className?: string }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${className || 'text-slate-400 hover:text-slate-600'}`}
    title={label}
  >
    <Icon size={14} />
  </button>
);

// --- Order Detail Sheet ---
const OrderSheet = ({ order, onClose, onStatusChange, updating }: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  updating: boolean;
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [order]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250);
  };

  if (!order) return null;

  const nextStatus = order.status === 'confirmed' ? 'pending' : 'confirmed';
  const actionLabel = order.status === 'confirmed' ? 'Mark as Pending' : 'Confirm Order';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Status & Timeline Card */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeline</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <ShoppingBag size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Order Placed</p>
                    <p className="text-xs text-slate-500">{format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
                {order.pickup_time && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Calendar size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Pickup Scheduled</p>
                      <p className="text-xs text-slate-500">{format(new Date(order.pickup_time), 'MMM d, yyyy · h:mm a')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Details Card */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer Information</p>
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">Customer since {format(new Date(order.created_at), 'MMM yyyy')}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                <a href={`tel:${order.customer_phone}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <span className="text-sm font-medium text-slate-700">{order.customer_phone}</span>
                  </div>
                </a>
                {order.customer_email && (
                  <a href={`mailto:${order.customer_email}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Mail size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <span className="text-sm font-medium text-slate-700">{order.customer_email}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Card */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Order Items</p>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shrink-0">
                  <Package size={28} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg">{order.product_name}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Hash size={12} /> {order.quantity}x
                    </span>
                    {order.flavor && (
                      <span className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-3 py-1 rounded-full font-semibold border border-indigo-100">
                        {order.flavor}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-slate-900">
                    ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                  </p>
                  {order.unit_price && order.quantity > 1 && (
                    <p className="text-xs text-slate-400">${order.unit_price.toFixed(2)} each</p>
                  )}
                </div>
              </div>

              {order.special_instructions && (
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <MessageSquare size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-1">Special Instructions</p>
                    <p className="text-sm text-amber-800">{order.special_instructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100 shadow-lg">
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
            <a href={`tel:${order.customer_phone}`} className="flex-1 py-3 bg-blue-50 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
              <Phone size={16} /> Call
            </a>
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              disabled={updating}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm text-white flex items-center justify-center gap-2 ${order.status === 'confirmed'
                ? 'bg-slate-500 hover:bg-slate-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
                } ${updating ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {updating ? <RefreshCw size={16} className="animate-spin" /> : null}
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        ordersApi.getOrders(page, PAGE_SIZE, statusFilter || undefined),
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

  const handleToggleStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingIds(prev => new Set(prev).add(orderId));
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);

      // Update selected order if it's the one being modified
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Refresh stats quietly
      ordersApi.getOrderStats().then(setStats);
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

  // Filter and sort orders client-side (in addition to server-side status filter)
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_phone.includes(query) ||
        o.product_name.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price-high':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'price-low':
          return (a.total_price || 0) - (b.total_price || 0);
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [orders, searchQuery, sortBy]);

  // Calculate revenue from stats
  const totalRevenue = stats ? (stats.pending * 25 + stats.confirmed * 25) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track all your orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/25">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Package size={22} className="text-white" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">Total</span>
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-xs text-indigo-100 mt-1">All time orders</p>
            </div>

            {/* Pending */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/25">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Clock size={22} className="text-white" />
                </div>
                {stats.pending > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium animate-pulse">Attention</span>
                )}
              </div>
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-xs text-amber-100 mt-1">Awaiting confirmation</p>
            </div>

            {/* Confirmed */}
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <CheckCircle size={22} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-emerald-100 mt-1">Confirmed orders</p>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/25">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <DollarSign size={22} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-purple-100 mt-1">Est. revenue</p>
            </div>
          </div>
        )}

        {/* Enhanced Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or product..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { value: '', label: 'All', icon: ShoppingBag },
                { value: 'pending', label: 'Pending', icon: Clock },
                { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === option.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <option.icon size={14} />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
              <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Failed to load orders</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchOrders} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24">
              <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-5">
                <ShoppingBag size={36} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-md">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search or filters'
                  : 'Orders placed via your AI phone agent will appear here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Order Details</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pickup</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Ordered</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                              {order.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{order.customer_name}</p>
                              <a
                                href={`tel:${order.customer_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5 transition-colors"
                              >
                                <Phone size={11} />
                                {order.customer_phone}
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                {order.quantity}x
                              </span>
                              <span className="font-semibold text-slate-900 truncate">{order.product_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {order.flavor && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full border border-indigo-100">
                                  {order.flavor}
                                </span>
                              )}
                              {order.special_instructions && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full flex items-center gap-1" title={order.special_instructions}>
                                  <MessageSquare size={10} /> Note
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          {(order.total_price || order.unit_price) ? (
                            <span className="font-bold text-slate-900 text-lg">
                              ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>

                        {/* Pickup Time */}
                        <td className="px-6 py-4">
                          {order.pickup_time ? (
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{format(new Date(order.pickup_time), 'MMM d')}</p>
                              <p className="text-xs text-slate-400">{format(new Date(order.pickup_time), 'h:mm a')}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {format(new Date(order.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <QuickActionButton
                              icon={Eye}
                              label="View Details"
                              onClick={() => setSelectedOrder(order)}
                            />

                            {order.status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(order.id, 'confirmed');
                                }}
                                disabled={updatingIds.has(order.id)}
                                className={`p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors ${updatingIds.has(order.id) ? 'opacity-50' : ''}`}
                                title="Confirm Order"
                              >
                                {updatingIds.has(order.id)
                                  ? <RefreshCw size={14} className="animate-spin" />
                                  : <CheckCircle size={14} />
                                }
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{Math.min((page - 1) * PAGE_SIZE + 1, total)}</span> to{' '}
                  <span className="font-semibold text-slate-700">{Math.min(page * PAGE_SIZE, total)}</span> of{' '}
                  <span className="font-semibold text-slate-700">{total}</span> orders
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-600 font-medium px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <OrderSheet
        key={selectedOrder?.id}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleToggleStatus}
        updating={selectedOrder ? updatingIds.has(selectedOrder.id) : false}
      />
    </DashboardLayout>
  );
}
