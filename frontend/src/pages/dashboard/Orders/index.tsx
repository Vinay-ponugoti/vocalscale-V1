import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import {
  ShoppingBag, Search, RefreshCw,
  CheckCircle, Clock, Package,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle, Phone, Mail, Calendar,
  X, DollarSign, MessageSquare, Hash
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 20;

// --- Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const isPending = status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isPending
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      {isPending ? 'Pending' : 'Confirmed'}
    </span>
  );
};

// --- Status Toggle (simple click to toggle) ---
const StatusToggle = ({ status, onToggle, loading }: { status: string; onToggle: () => void; loading: boolean }) => (
  <button
    onClick={(e) => { e.stopPropagation(); if (!loading) onToggle(); }}
    disabled={loading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      status === 'confirmed'
        ? 'bg-emerald-500 focus:ring-emerald-500'
        : 'bg-slate-300 focus:ring-slate-400'
    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    title={status === 'pending' ? 'Mark as Confirmed' : 'Mark as Pending'}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
      status === 'confirmed' ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

// --- Order Detail Sheet ---
const OrderSheet = ({ order, onClose, onToggleStatus }: {
  order: Order | null;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (order) {
      setIsClosing(false);
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

  const isPending = order.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-250 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto transform transition-transform duration-250 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{order.id.slice(0, 8)}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Status Card */}
          <div className={`rounded-xl p-4 border ${isPending ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <StatusToggle
                status={order.status}
                onToggle={() => onToggleStatus(order.id)}
                loading={false}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <Clock size={11} />
              Updated {formatDistanceToNow(new Date(order.updated_at), { addSuffix: true })}
            </p>
          </div>

          {/* Customer Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Info</h3>
            <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{order.customer_name}</p>
                </div>
              </div>
              <a href={`tel:${order.customer_phone}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone size={14} className="text-blue-600" />
                </div>
                <span className="text-sm text-slate-700 font-medium">{order.customer_phone}</span>
              </a>
              {order.customer_email && (
                <a href={`mailto:${order.customer_email}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Mail size={14} className="text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-700">{order.customer_email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Details</h3>
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={20} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{order.product_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Hash size={10} /> Qty: {order.quantity}
                    </span>
                    {order.flavor && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                        {order.flavor}
                      </span>
                    )}
                  </div>
                </div>
                {(order.total_price || order.unit_price) && (
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">
                      ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                    </p>
                    {order.unit_price && order.quantity > 1 && (
                      <p className="text-[10px] text-slate-400">${order.unit_price.toFixed(2)} each</p>
                    )}
                  </div>
                )}
              </div>

              {order.special_instructions && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
                  <MessageSquare size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 italic">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pickup & Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timeline</h3>
            <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Clock size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Ordered</p>
                  <p className="text-sm font-medium text-slate-900">{format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}</p>
                </div>
              </div>
              {order.pickup_time && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Calendar size={14} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pickup Time</p>
                    <p className="text-sm font-medium text-slate-900">{format(new Date(order.pickup_time), 'MMM d · h:mm a')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100 flex gap-3">
          <button onClick={handleClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
          <button
            onClick={() => onToggleStatus(order.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              isPending
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isPending ? 'Confirm Order' : 'Mark Pending'}
          </button>
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrders(page, PAGE_SIZE, statusFilter || undefined);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ordersApi.getOrderStats();
      setStats(data);
    } catch {
      // Stats are non-critical
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);
  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); }, [statusFilter]);

  // Toggle between pending <-> confirmed
  const handleToggleStatus = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newStatus = order.status === 'pending' ? 'confirmed' : 'pending';

    try {
      setUpdatingIds(prev => new Set(prev).add(orderId));

      // Optimistic update
      setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

      await ordersApi.updateOrderStatus(orderId, newStatus);
      fetchStats();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
      fetchOrders();
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(q) ||
      order.customer_phone?.includes(q) ||
      order.product_name?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage orders placed through your AI receptionist</p>
          </div>
          <button
            onClick={() => { fetchOrders(); fetchStats(); }}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards — only 3: Total, Pending, Confirmed */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Package size={18} className="text-indigo-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Total Orders</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={18} className="text-amber-600" />
                </div>
                {stats.pending > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    Needs attention
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Pending</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={18} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.confirmed}</p>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">Confirmed</p>
            </div>
          </div>
        )}

        {/* Search + Filter Bar */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, or product..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['', 'pending', 'confirmed'].map((val) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === val
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {val === '' ? 'All' : val === 'pending' ? 'Pending' : 'Confirmed'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load orders</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={fetchOrders} className="ml-auto px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No orders yet</h3>
              <p className="text-slate-500 mt-1 text-sm max-w-xs">
                {searchQuery ? 'Try a different search term' :
                  statusFilter ? 'No orders with this status' :
                    'Orders placed via your AI phone agent will show up here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Order</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Price</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pickup</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Customer — name + phone always visible */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {order.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{order.customer_name}</p>
                              <a
                                href={`tel:${order.customer_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5 transition-colors"
                              >
                                <Phone size={10} />
                                {order.customer_phone}
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Product + Qty + Flavor */}
                        <td className="px-5 py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {order.quantity}x
                              </span>
                              <span className="font-medium text-slate-900 truncate">{order.product_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {order.flavor && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                  {order.flavor}
                                </span>
                              )}
                              {order.special_instructions && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full flex items-center gap-0.5" title={order.special_instructions}>
                                  <MessageSquare size={8} /> Note
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          {(order.total_price || order.unit_price) ? (
                            <span className="font-semibold text-slate-900">
                              ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Pickup Time */}
                        <td className="px-5 py-4">
                          {order.pickup_time ? (
                            <div>
                              <p className="text-xs font-medium text-slate-900">{format(new Date(order.pickup_time), 'MMM d')}</p>
                              <p className="text-[10px] text-slate-400">{format(new Date(order.pickup_time), 'h:mm a')}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <StatusToggle
                              status={order.status}
                              onToggle={() => handleToggleStatus(order.id)}
                              loading={updatingIds.has(order.id)}
                            />
                            <span className={`text-xs font-medium ${order.status === 'confirmed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {order.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-xs font-medium text-slate-700">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {format(new Date(order.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronsLeft size={14} /></button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                    <span className="text-xs text-slate-500 font-medium px-3">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronsRight size={14} /></button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <OrderSheet
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onToggleStatus={handleToggleStatus}
      />
    </DashboardLayout>
  );
}
