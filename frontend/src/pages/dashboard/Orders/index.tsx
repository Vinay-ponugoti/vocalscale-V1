import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';
import {
  ShoppingBag, Search, RefreshCw, Download,
  CheckCircle, Clock, Package, X, Phone, Mail, Calendar,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle, DollarSign, MessageSquare, Hash,
  Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const PAGE_SIZE = 20;

type OrderStatus = 'pending' | 'confirmed';

// --- Status Badge using shadcn Badge ---
const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant={status === 'confirmed' ? 'success' : 'warning'} size="lg" className="gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
    {status === 'confirmed' ? 'Confirmed' : 'Pending'}
  </Badge>
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
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-lg bg-background shadow-2xl h-full overflow-y-auto transform transition-transform duration-300 ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}>

        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Order Details</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 space-y-6">

          {/* Status & Timeline */}
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Status</p>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag size={14} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Order Placed</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}</p>
                    </div>
                  </div>
                  {order.pickup_time && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Pickup Scheduled</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.pickup_time), 'MMM d, yyyy · h:mm a')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer Information</p>
            <Card className="border-border/60 overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-lg">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">Customer since {format(new Date(order.created_at), 'MMM yyyy')}</p>
                </div>
              </div>
              <div className="divide-y divide-border">
                <a href={`tel:${order.customer_phone}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Phone size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <span className="text-sm font-medium text-foreground">{order.customer_phone}</span>
                  </div>
                </a>
                {order.customer_email && (
                  <a href={`mailto:${order.customer_email}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Mail size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <span className="text-sm font-medium text-foreground">{order.customer_email}</span>
                    </div>
                  </a>
                )}
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Items</p>
            <Card className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shrink-0">
                    <Package size={28} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{order.product_name}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" size="sm" className="gap-1">
                        <Hash size={10} /> {order.quantity}x
                      </Badge>
                      {order.flavor && (
                        <Badge variant="info" size="sm">{order.flavor}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-foreground">
                      ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                    </p>
                    {order.unit_price && order.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">${order.unit_price.toFixed(2)} each</p>
                    )}
                  </div>
                </div>

                {order.special_instructions && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <MessageSquare size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1">Special Instructions</p>
                      <p className="text-sm text-amber-800">{order.special_instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 p-4 bg-background border-t border-border shadow-lg">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Close
            </Button>
            <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50" asChild>
              <a href={`tel:${order.customer_phone}`}>
                <Phone size={16} /> Call
              </a>
            </Button>
            <Button
              variant={order.status === 'confirmed' ? 'secondary' : 'default'}
              className="flex-1"
              onClick={() => onStatusChange(order.id, nextStatus)}
              isLoading={updating}
            >
              {!updating && (order.status === 'confirmed' ? <Clock size={16} /> : <CheckCircle size={16} />)}
              {actionLabel}
            </Button>
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
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
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

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_phone.includes(query) ||
        o.product_name.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price-high':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'price-low':
          return (a.total_price || 0) - (b.total_price || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return result;
  }, [orders, searchQuery, sortBy]);

  const totalRevenue = stats ? (stats.pending * 25 + stats.confirmed * 25) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all your orders</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={fetchOrders} title="Refresh">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button variant="default" size="sm">
              <Download size={16} /> Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Package size={22} />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px]">Total</Badge>
                </div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs opacity-80 mt-1">All time orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Clock size={22} />
                  </div>
                  {stats.pending > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] animate-pulse">Attention</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold">{stats.pending}</p>
                <p className="text-xs opacity-80 mt-1">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <CheckCircle size={22} />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stats.confirmed}</p>
                <p className="text-xs opacity-80 mt-1">Confirmed orders</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <DollarSign size={22} />
                  </div>
                </div>
                <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
                <p className="text-xs opacity-80 mt-1">Est. revenue</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or product..."
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all text-sm bg-muted/30 focus:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter Tabs */}
                <div className="flex bg-muted p-1 rounded-lg">
                  {[
                    { value: '', label: 'All', icon: ShoppingBag },
                    { value: 'pending', label: 'Pending', icon: Clock },
                    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${statusFilter === option.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <option.icon size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Sort Select */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" value={
                      sortBy === 'newest' ? 'Newest First' :
                        sortBy === 'oldest' ? 'Oldest First' :
                          sortBy === 'price-high' ? 'Price: High' :
                            'Price: Low'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Failed to load orders</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="border-red-200 text-red-700 hover:bg-red-100">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24">
              <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-5">
                <ShoppingBag size={36} className="text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No orders found</h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-md">
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
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Details</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pickup</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ordered</th>
                      <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-accent/50 transition-all cursor-pointer group"
                        onClick={() => setSelectedOrder(order)}
                      >
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {order.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{order.customer_name}</p>
                              <a
                                href={`tel:${order.customer_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 transition-colors"
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
                              <Badge variant="default" size="sm" className="text-[10px]">
                                {order.quantity}x
                              </Badge>
                              <span className="font-semibold text-foreground truncate">{order.product_name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {order.flavor && (
                                <Badge variant="info" size="sm">{order.flavor}</Badge>
                              )}
                              {order.special_instructions && (
                                <Badge variant="warning" size="sm" className="gap-1" title={order.special_instructions}>
                                  <MessageSquare size={10} /> Note
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          {(order.total_price || order.unit_price) ? (
                            <span className="font-bold text-foreground text-lg">
                              ${(order.total_price || (order.unit_price! * order.quantity)).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </td>

                        {/* Pickup Time */}
                        <td className="px-6 py-4">
                          {order.pickup_time ? (
                            <div>
                              <p className="text-sm font-semibold text-foreground">{format(new Date(order.pickup_time), 'MMM d')}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(order.pickup_time), 'h:mm a')}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedOrder(order)} title="View Details">
                              <Eye size={14} />
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(order.id, 'confirmed');
                                }}
                                disabled={updatingIds.has(order.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Confirm Order"
                              >
                                {updatingIds.has(order.id)
                                  ? <RefreshCw size={14} className="animate-spin" />
                                  : <CheckCircle size={14} />
                                }
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{Math.min((page - 1) * PAGE_SIZE + 1, total)}</span> to{' '}
                  <span className="font-semibold text-foreground">{Math.min(page * PAGE_SIZE, total)}</span> of{' '}
                  <span className="font-semibold text-foreground">{total}</span> orders
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setPage(1)} disabled={page === 1}>
                      <ChevronsLeft size={16} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm text-muted-foreground font-medium px-3">
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="ghost" size="icon-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight size={16} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                      <ChevronsRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
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
