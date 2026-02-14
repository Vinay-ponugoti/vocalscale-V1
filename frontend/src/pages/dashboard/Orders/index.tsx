import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import {
  ShoppingBag, Search, Filter, RefreshCw,
  CheckCircle, XCircle, Clock, Package,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  TrendingUp, AlertCircle, PackageCheck,
  MoreHorizontal, Phone, Mail, User, Calendar,
  ArrowRight, X // Added missing icons
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 20;

// --- Components ---

const StatusBadge = ({ status, className }: { status: string, className?: string }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-green-50 text-green-700 ring-1 ring-green-100';
      case 'ready': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
      case 'picked_up': return 'bg-gray-50 text-gray-700 ring-1 ring-gray-100';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-1 ring-red-100';
      default: return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100';
    }
  };

  const getStatusDot = (s: string) => {
    switch (s) {
      case 'confirmed': return 'bg-green-500';
      case 'ready': return 'bg-blue-500';
      case 'picked_up': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
      {status.replace('_', ' ')}
    </span>
  );
}


const StatusDropdown = ({ currentStatus, onUpdate, loading }: { currentStatus: string, onUpdate: (s: string) => void, loading: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready', label: 'Ready' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-1 rounded-full transition-all focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-offset-1 hover:ring-slate-100'}`}
      >
        <StatusBadge status={currentStatus} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onUpdate(s.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${s.value === currentStatus ? 'font-medium text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
            >
              {/* Mini dot for consistent UI */}
              <div className={`w-1.5 h-1.5 rounded-full ${s.value === currentStatus ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const OrderSheet = ({ order, onClose, onUpdateStatus }: { order: Order | null, onClose: () => void, onUpdateStatus: (id: string, s: string) => void }) => {
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
    setTimeout(onClose, 300); // Match transition duration
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {order.id.slice(0, 8)}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-500">Current Status</span>
              <StatusDropdown currentStatus={order.status} onUpdate={(s) => onUpdateStatus(order.id, s)} loading={false} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={12} />
              <span>Last updated {formatDistanceToNow(new Date(order.updated_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Customer</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                {order.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-lg">{order.customer_name}</h4>
                <div className="flex flex-col gap-2 mt-2">
                  <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                    <Phone size={14} />
                    {order.customer_phone}
                  </a>
                  {order.customer_email && (
                    <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                      <Mail size={14} />
                      {order.customer_email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Items</h3>
            <div className="border rounded-xl p-4 flex gap-4 bg-white shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Package size={24} className="text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">{order.quantity}x</span>
                  <span className="font-semibold text-slate-900">{order.product_name}</span>
                </div>
                {order.flavor && (
                  <div className="text-sm text-slate-500 mt-1">Flavor: <span className="text-slate-700">{order.flavor}</span></div>
                )}
                {order.special_instructions && (
                  <div className="mt-3 text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg flex gap-2">
                    <div className='shrink-0 mt-0.5'><AlertCircle size={14} /></div>
                    <span className="italic">"{order.special_instructions}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline / Additional Metadata */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              <div className="relative flex gap-4">
                <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100 shrink-0 z-10" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Order Placed</p>
                  <p className="text-xs text-slate-500">{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              {order.pickup_time && (
                <div className="relative flex gap-4">
                  <div className="w-4 h-4 rounded-full bg-indigo-200 border-2 border-white ring-1 ring-indigo-100 shrink-0 z-10" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Scheduled Pickup</p>
                    <p className="text-xs text-slate-500">{format(new Date(order.pickup_time), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-slate-100 flex gap-3">
          <button onClick={handleClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
          {order.call_id && (
            <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
              View Call Log
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


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

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Update status (optimistic UI could be added here, currently refetches)
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? ({ ...prev, status: newStatus as any }) : null);
      }

      await ordersApi.updateOrderStatus(orderId, newStatus);
      fetchStats(); // Update stats in background
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
      fetchOrders(); // Revert on failure
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

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
            <p className="text-slate-500 mt-1 text-sm">Manage customer orders placed via AI agent</p>
          </div>
          <button
            onClick={() => { fetchOrders(); fetchStats(); }}
            className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Orders', value: stats.total, icon: Package, color: 'indigo' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
              { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'green' },
              { label: 'Ready', value: stats.ready, icon: PackageCheck, color: 'blue' },
              { label: 'Cancelled', value: stats.cancelled, icon: AlertCircle, color: 'red' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                    <stat.icon size={16} className={`text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, or product..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="text-slate-400 w-4 h-4" />
            <div className="relative w-full">
              <select
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready">Ready for Pickup</option>
                <option value="picked_up">Picked Up</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
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

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          {loading && orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-16">
              <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No orders found</h3>
              <p className="text-slate-500 mt-1 text-sm">
                {searchQuery ? 'Try adjusting your search query' :
                  statusFilter ? 'No orders with this status' :
                    'Orders placed via AI agent will appear here'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-[25%]">Customer</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-[35%]">Product & Details</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-[20%]">Status</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-[15%]">Time</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white shadow-sm">
                              {order.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{order.customer_name}</div>
                              <div className="flex items-center gap-2 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="text-slate-400 hover:text-indigo-600 p-1 -ml-1"
                                  onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${order.customer_phone}`; }}
                                  title="Call Customer"
                                >
                                  <Phone size={12} />
                                </button>
                                {order.customer_email && (
                                  <button
                                    className="text-slate-400 hover:text-indigo-600 p-1"
                                    onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${order.customer_email}`; }}
                                    title="Email Customer"
                                  >
                                    <Mail size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className='flex items-start gap-3'>
                            <div className="p-1 px-2 bg-slate-100 rounded text-xs font-bold text-slate-600 whitespace-nowrap">
                              {order.quantity} x
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{order.product_name}</div>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {order.flavor && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                    {order.flavor}
                                  </span>
                                )}
                                {order.special_instructions && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded border border-yellow-100 flex items-center gap-1">
                                    <span>Note</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown currentStatus={order.status} onUpdate={(s) => handleStatusUpdate(order.id, s)} loading={false} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-medium text-xs">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {format(new Date(order.created_at), 'h:mm a')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                            <ArrowRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} orders
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

                    <div className="flex items-center gap-1 px-2">
                      <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
                    </div>

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
            </>
          )}
        </div>
      </div>

      <OrderSheet
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleStatusUpdate}
      />
    </DashboardLayout>
  );
}
