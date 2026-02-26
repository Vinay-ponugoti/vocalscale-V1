import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import CalendarPicker from '../../../components/dashboard/CalendarPicker';
import { OrderDetailPanel } from './OrderDetailPanel';
import type { OrderWithMeta, OrderStatus } from '@/types/orders';
import { OrderStatsGrid } from './OrderStatsGrid';
import { OrdersTable } from './OrdersTable';
import { useOrders } from '../../../hooks/useOrders';
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
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('confirmed');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithMeta | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sortConfig, setSortConfig] = useState<{
    key: 'created_at' | 'total_price';
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });

  // Debounced search — 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // React Query hook — cached, parallel stats+orders fetch
  const {
    orders,
    total,
    stats,
    loading,
    error,
    updateStatus,
    updatingId,
    refetch,
  } = useOrders(statusFilter, page);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Process orders with computed fields and normalize status
  const processedOrders = useMemo(() => {
    return orders.map(order => {
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

    if (!isToday) {
      result = result.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
    }

    // Search filter (uses debounced value)
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
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
  }, [processedOrders, debouncedSearch, sortConfig, selectedDate]);

  const handleToggleStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      // Error handled by React Query
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
              onClick={refetch}
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

        {/* Stats Cards — skeleton while loading */}
        {stats ? (
          <OrderStatsGrid stats={stats} />
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse mb-2" />
                <div className="w-16 h-7 bg-slate-100 rounded animate-pulse mb-1" />
                <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : null}

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
              onClick={refetch}
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
        updating={selectedOrder ? updatingId === selectedOrder.id : false}
      />
    </DashboardLayout>
  );
}
