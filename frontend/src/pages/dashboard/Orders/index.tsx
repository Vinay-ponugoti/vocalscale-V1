import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/InputField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/Select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Hash,
  Eye,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type OrderStatus = 'pending' | 'confirmed';

// --- Types ---
interface OrderWithMeta extends Order {
  totalAmount: number;
}

// --- Enhanced Status Config ---
const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'warning' as const,
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    border: 'border-amber-300',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-emerald-700',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
};

// --- Enhanced Status Badge ---
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'gap-1.5 font-semibold border-2 px-3 py-1 shadow-sm',
        config.bg,
        config.color,
        config.border,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// --- Enhanced Stat Card ---
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  iconColor,
  accentColor,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  accentColor: string;
}) => (
  <Card className={cn(
    'relative overflow-hidden border-2 transition-all hover:shadow-lg hover:-translate-y-1',
    accentColor
  )}>
    <div className={cn('absolute inset-0 opacity-5', gradient)} />
    <CardContent className="p-6 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {description}
          </p>
        </div>
        <div className={cn(
          'h-14 w-14 rounded-xl flex items-center justify-center shadow-lg',
          gradient
        )}>
          <Icon className={cn('h-7 w-7', iconColor)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Enhanced Order Detail Sheet ---
const OrderDetailSheet = ({
  order,
  open,
  onOpenChange,
  onStatusChange,
  updating,
}: {
  order: OrderWithMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  updating: boolean;
}) => {
  if (!order) return null;

  const nextStatus = order.status === 'confirmed' ? 'pending' : 'confirmed';
  const actionLabel = order.status === 'confirmed' ? 'Mark as Pending' : 'Confirm Order';
  const ActionIcon = order.status === 'confirmed' ? Clock : CheckCircle;


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="space-y-3 pb-4 border-b-2">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold">Order Details</SheetTitle>
              <SheetDescription className="font-mono text-sm font-semibold text-primary mt-1">
                #{order.id.slice(0, 8).toUpperCase()}
              </SheetDescription>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-6">
          <div className="space-y-6">
            {/* Amount & Timeline */}
            <div className="space-y-4">
              <div className={cn(
                'p-6 rounded-xl border-2 shadow-sm',
                'bg-gradient-to-br from-slate-50 to-slate-100/50'
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Amount</p>
                    <p className="text-4xl font-bold text-slate-900 mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ordered</p>
                    <p className="font-semibold text-slate-700 mt-1">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h4>
                <div className="space-y-4 relative pl-6 border-l-2 border-slate-200">
                  <div className="relative">
                    <div className="absolute -left-[25px] w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white shadow-md" />
                    <div className="bg-white p-4 rounded-lg border-2 border-slate-100 shadow-sm">
                      <p className="font-bold text-slate-900">Order Placed</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                  {order.pickup_time && (
                    <div className="relative">
                      <div className="absolute -left-[25px] w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-4 border-white shadow-md" />
                      <div className="bg-white p-4 rounded-lg border-2 border-slate-100 shadow-sm">
                        <p className="font-bold text-slate-900">Pickup Scheduled</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {format(new Date(order.pickup_time), 'MMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Customer Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer</h4>
              <Card className="border-2 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xl font-bold">
                        {order.customer_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate text-slate-900">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer since {format(new Date(order.created_at), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-blue-900 group-hover:text-blue-700">{order.customer_phone}</span>
                    </a>
                    {order.customer_email && (
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border-2 border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-purple-900 truncate group-hover:text-purple-700">{order.customer_email}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Items</h4>
              <Card className="border-2 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 shadow-sm border-2 border-slate-200">
                      <Package className="h-10 w-10 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-lg truncate text-slate-900">{order.product_name}</p>
                        <p className="font-bold text-xl text-primary">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="secondary" className="gap-1.5 font-semibold border-2">
                          <Hash className="h-3.5 w-3.5" />
                          {order.quantity}x
                        </Badge>
                        {order.flavor && (
                          <Badge variant="outline" className="font-semibold border-2">{order.flavor}</Badge>
                        )}
                      </div>
                      {order.unit_price && order.quantity > 1 && (
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          ${order.unit_price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>

                  {order.special_instructions && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-xl flex gap-3 shadow-sm">
                      <MessageSquare className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">Special Instructions</p>
                        <p className="text-sm text-amber-900 font-medium">{order.special_instructions}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col gap-2 sm:flex-row border-t-2 pt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto font-semibold border-2">Close</Button>
          </SheetClose>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 font-semibold border-2"
            asChild
          >
            <a href={`tel:${order.customer_phone}`}>
              <Phone className="h-4 w-4" />
              Call Customer
            </a>
          </Button>
          <Button
            className={cn(
              "w-full sm:w-auto gap-2 font-semibold shadow-md",
              order.status === 'confirmed'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            )}
            onClick={() => onStatusChange(order.id, nextStatus)}
            disabled={updating}
          >
            {updating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ActionIcon className="h-4 w-4" />
            )}
            {actionLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
  const [sheetOpen, setSheetOpen] = useState(false);
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

      // Refresh stats
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
    setSheetOpen(true);
  };

  const totalRevenue = stats ? (stats.pending * 25 + stats.confirmed * 25) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Orders
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Manage and track all your orders in one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchOrders}
              disabled={loading}
              className="h-10 w-10 border-2 shadow-sm"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button variant="outline" className="gap-2 font-semibold border-2 shadow-sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={stats.total}
              description="All time orders"
              icon={ShoppingBag}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              iconColor="text-white"
              accentColor="border-l-blue-500"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              description="Awaiting confirmation"
              icon={Clock}
              gradient="bg-gradient-to-br from-amber-500 to-amber-600"
              iconColor="text-white"
              accentColor="border-l-amber-500"
            />
            <StatCard
              title="Confirmed"
              value={stats.confirmed}
              description="Ready for pickup"
              icon={CheckCircle}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
              iconColor="text-white"
              accentColor="border-l-emerald-500"
            />
            <StatCard
              title="Revenue"
              value={`$${totalRevenue.toFixed(0)}`}
              description="Estimated total"
              icon={DollarSign}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              iconColor="text-white"
              accentColor="border-l-purple-500"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="border-2 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  label=''
                  placeholder="Search customers, phone, or products..."
                  className="pl-10 h-11 border-2 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as OrderStatus | 'all');
                    setPage(1);
                  }}
                  className="w-auto"
                >
                  <TabsList className="h-11 border-2 shadow-sm">
                    <TabsTrigger value="all" className="font-semibold">All Orders</TabsTrigger>
                    <TabsTrigger value="pending" className="font-semibold">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed" className="font-semibold">Confirmed</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onValueChange={(v) => {
                    const [key, direction] = v.split('-') as [typeof sortConfig.key, typeof sortConfig.direction];
                    setSortConfig({ key, direction });
                  }}
                >
                  <SelectTrigger className="h-11 w-auto font-semibold border-2 shadow-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="total_price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="total_price-asc">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900">Something went wrong</h3>
              <p className="mt-2 text-red-700 font-medium max-w-md">
                {error}. Please try refreshing the page.
              </p>
              <Button
                onClick={fetchOrders}
                className="mt-4 bg-red-600 hover:bg-red-700 font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!error && (
          <Card className="border-2 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Order ID</TableHead>
                  <TableHead className="font-bold text-slate-900">Customer</TableHead>
                  <TableHead className="font-bold text-slate-900">Product</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Amount</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-900">Date</TableHead>
                  <TableHead className="font-bold text-slate-900">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-20 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                          <span className="font-medium text-muted-foreground">Loading orders...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-semibold text-slate-900">No orders found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className='cursor-pointer hover:bg-slate-50 transition-colors'
                    >
                      <TableCell className="font-mono text-sm font-bold text-primary">
                        #{order.id.slice(0, 6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className='font-bold text-slate-900'>{order.customer_name}</div>
                        <div className='text-sm text-muted-foreground font-medium'>{order.customer_phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className='font-bold text-slate-900'>{order.product_name}</div>
                        {order.flavor && (
                          <div className='text-sm text-muted-foreground font-medium'>{order.flavor}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-medium">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 hover:bg-slate-100'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(order);
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Pagination */}
        {!error && filteredOrders.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="font-bold text-slate-900">{Math.min(PAGE_SIZE * (page - 1) + 1, total)}</span> - <span className="font-bold text-slate-900">{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-bold text-slate-900">{total}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="h-9 w-9 border-2 shadow-sm"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 border-2 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold w-10 text-center bg-slate-100 px-3 py-2 rounded-lg border-2">{page}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 border-2 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="h-9 w-9 border-2 shadow-sm"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onStatusChange={handleToggleStatus}
          updating={updatingIds.has(selectedOrder.id)}
        />
      )}
    </DashboardLayout>
  );
}