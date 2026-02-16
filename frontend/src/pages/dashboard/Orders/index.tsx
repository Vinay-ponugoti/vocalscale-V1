import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import CalendarPicker from '../../../components/dashboard/CalendarPicker';
import { OrderDetailPanel } from './OrderDetailPanel';
import type { OrderWithMeta, OrderStatus } from '@/types/orders';
import { OrderStatsGrid } from './OrderStatsGrid';
import { OrdersTable } from './OrdersTable';
import {
  Search,
  RefreshCw,
  Download,
  AlertCircle,
  ChevronRight,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { startOfDay, endOfDay, isSameDay, addDays, subDays } from 'date-fns';

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('confirmed');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithMeta | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
      let ordersData: Order[] = [];
      let totalCount = 0;

      if (statusFilter === 'confirmed') {
        // Fetch both pending and confirmed explicitly to ensure we get everything
        // We increase page size to capture most active orders since we're merging client-side
        const [pendingRes, confirmedRes] = await Promise.all([
          ordersApi.getOrders(1, 100, 'pending'),
          ordersApi.getOrders(1, 100, 'confirmed')
        ]);

        ordersData = [...(pendingRes.orders || []), ...(confirmedRes.orders || [])];
        totalCount = (pendingRes.total || 0) + (confirmedRes.total || 0);

        // Stats
        const statsRes = await ordersApi.getOrderStats();

        // Calculate revenue from loaded orders if backend returns 0
        const calculatedRevenue = ordersData.reduce((sum, o) => {
          return sum + (o.total_price || (o.unit_price || 0) * o.quantity);
        }, 0);

        if (!statsRes.revenue && calculatedRevenue > 0) {
          statsRes.revenue = calculatedRevenue;
        }

        setStats(statsRes);
      } else {
        // Cancelled view
        const [ordersRes, statsRes] = await Promise.all([
          ordersApi.getOrders(page, PAGE_SIZE, 'cancelled'),
          ordersApi.getOrderStats()
        ]);
        ordersData = ordersRes.orders || [];
        totalCount = ordersRes.total || 0;
        setStats(statsRes);
      }

      setOrders(ordersData);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Process orders with computed fields and normalize status
  const processedOrders = useMemo(() => {
    return orders.map(order => {
      // Treat 'pending' as 'confirmed' for display
      const currentStatus = order.status as string;
      const normalizedStatus = (currentStatus === 'pending' || currentStatus === 'confirmed')
        ? 'confirmed' as OrderStatus
        : 'cancelled' as OrderStatus;

      return {
        ...order,
        status: normalizedStatus,
        totalAmount: order.total_price || (order.unit_price || 0) * order.quantity,
      };
    });
  }, [orders]);

  // Filter and sort orders client-side (including date filter)
  const filteredOrders = useMemo(() => {
    let result = [...processedOrders];

    // Date filter
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    const today = new Date();
    const isToday = isSameDay(selectedDate, today);

    // Only filter by date if not today (show all for today by default like Home page)
    if (!isToday) {
      result = result.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
    }

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
  }, [processedOrders, searchQuery, sortConfig, selectedDate]);

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

      // Refresh stats and potentially list if we want to move it out of the current view
      const newStats = await ordersApi.getOrderStats();
      setStats(newStats);

      // Optional: Refresh list if we want to remove it from view immediately
      fetchOrders();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage and track all your orders in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Date Navigation */}
            <button
              onClick={() => setSelectedDate(prev => subDays(prev, 1))}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100"
              title="Previous day"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <CalendarPicker
              date={selectedDate}
              setDate={setSelectedDate}
              maxDate={new Date()}
            />
            <button
              onClick={() => setSelectedDate(prev => {
                const next = addDays(prev, 1);
                return next > new Date() ? prev : next;
              })}
              disabled={isSameDay(selectedDate, new Date())}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next day"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

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
        {stats && <OrderStatsGrid stats={stats} />}

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
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => { setStatusFilter('confirmed'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${statusFilter === 'confirmed'
                  ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <CheckCircle size={12} className={statusFilter === 'confirmed' ? 'text-green-500' : 'text-slate-400'} />
                Confirmed
              </button>
              <button
                onClick={() => { setStatusFilter('cancelled'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${statusFilter === 'cancelled'
                  ? 'bg-white text-red-700 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <XCircle size={12} className={statusFilter === 'cancelled' ? 'text-red-500' : 'text-slate-400'} />
                Cancelled
              </button>
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
          <OrdersTable
            orders={filteredOrders}
            loading={loading}
            onRowClick={handleRowClick}
            page={page}
            total={total}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
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