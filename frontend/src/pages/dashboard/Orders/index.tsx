import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ordersApi, type Order, type OrderStats } from '../../../api/orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/InputField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/Select';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetDescription,
//   SheetFooter,
//   SheetClose,
// } from '@/components/ui/sheet';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Separator } from '@/components/ui/separator';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  Package,
  X,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  DollarSign,
  MessageSquare,
  Hash,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

type OrderStatus = 'pending' | 'confirmed';

// --- Types ---
interface OrderWithMeta extends Order {
  totalAmount: number;
}

// --- Status Config ---
const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'warning' as const,
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'success' as const,
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

// --- Status Badge Component ---
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        'gap-1.5 font-medium border',
        status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        status === 'confirmed' && 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      {config.label}
    </Badge>
  );
};

// --- Stat Card Component ---
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  className?: string;
}) => (
  <Card className={cn('relative overflow-hidden', className)}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <Badge variant={trend.positive ? 'success' : 'destructive'} className="text-xs">
            {trend.positive ? '+' : ''}{trend.value}%
          </Badge>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

// --- Order Detail Sheet ---
// const OrderDetailSheet = ({
//   order,
//   open,
//   onOpenChange,
//   onStatusChange,
//   updating,
// }: {
//   order: OrderWithMeta | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onStatusChange: (id: string, status: OrderStatus) => void;
//   updating: boolean;
// }) => {
//   if (!order) return null;

//   const nextStatus = order.status === 'confirmed' ? 'pending' : 'confirmed';
//   const actionLabel = order.status === 'confirmed' ? 'Mark as Pending' : 'Confirm Order';
//   const ActionIcon = order.status === 'confirmed' ? Clock : CheckCircle;

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent className="w-full sm:max-w-lg flex flex-col">
//         <SheetHeader className="space-y-2.5 pb-4 border-b">
//           <div className="flex items-center justify-between">
//             <div>
//               <SheetTitle className="text-xl">Order Details</SheetTitle>
//               <SheetDescription className="font-mono text-xs">
//                 #{order.id.slice(0, 8).toUpperCase()}
//               </SheetDescription>
//             </div>
//             <StatusBadge status={order.status} />
//           </div>
//         </SheetHeader>

//         <ScrollArea className="flex-1 -mx-6 px-6 py-6">
//           <div className="space-y-6">
//             {/* Amount & Timeline */}
//             <div className="space-y-4">
//               <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Total Amount</p>
//                   <p className="text-3xl font-bold">${order.totalAmount.toFixed(2)}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-muted-foreground">Ordered</p>
//                   <p className="font-medium">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h4>
//                 <div className="space-y-4 relative pl-4 border-l-2 border-muted">
//                   <div className="relative">
//                     <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
//                     <div>
//                       <p className="font-medium">Order Placed</p>
//                       <p className="text-sm text-muted-foreground">
//                         {format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
//                       </p>
//                     </div>
//                   </div>
//                   {order.pickup_time && (
//                     <div className="relative">
//                       <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
//                       <div>
//                         <p className="font-medium">Pickup Scheduled</p>
//                         <p className="text-sm text-muted-foreground">
//                           {format(new Date(order.pickup_time), 'MMM d, yyyy · h:mm a')}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <Separator />

//             {/* Customer Info */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer</h4>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-4">
//                     <Avatar className="h-12 w-12">
//                       <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
//                         {order.customer_name.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-semibold truncate">{order.customer_name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         Customer since {format(new Date(order.created_at), 'MMM yyyy')}
//                       </p>
//                     </div>
//                   </div>
//                   <Separator className="my-4" />
//                   <div className="space-y-3">
//                     <a 
//                       href={`tel:${order.customer_phone}`} 
//                       className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
//                     >
//                       <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
//                         <Phone className="h-4 w-4 text-blue-600" />
//                       </div>
//                       <span>{order.customer_phone}</span>
//                     </a>
//                     {order.customer_email && (
//                       <a 
//                         href={`mailto:${order.customer_email}`} 
//                         className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
//                       >
//                         <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center">
//                           <Mail className="h-4 w-4 text-purple-600" />
//                         </div>
//                         <span className="truncate">{order.customer_email}</span>
//                       </a>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Order Items */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Items</h4>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex gap-4">
//                     <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
//                       <Package className="h-8 w-8 text-muted-foreground" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-2">
//                         <p className="font-semibold truncate">{order.product_name}</p>
//                         <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
//                       </div>
//                       <div className="flex items-center gap-2 mt-2 flex-wrap">
//                         <Badge variant="secondary" className="gap-1">
//                           <Hash className="h-3 w-3" />
//                           {order.quantity}x
//                         </Badge>
//                         {order.flavor && (
//                           <Badge variant="outline">{order.flavor}</Badge>
//                         )}
//                       </div>
//                       {order.unit_price && order.quantity > 1 && (
//                         <p className="text-xs text-muted-foreground mt-1">
//                           ${order.unit_price.toFixed(2)} each
//                         </p>
//                       )}
//                     </div>
//                   </div>
                  
//                   {order.special_instructions && (
//                     <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-3">
//                       <MessageSquare className="h-5 w-5 text-amber-600 shrink-0" />
//                       <div>
//                         <p className="text-xs font-semibold text-amber-800 mb-0.5">Special Instructions</p>
//                         <p className="text-sm text-amber-900">{order.special_instructions}</p>
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </ScrollArea>

//         <SheetFooter className="flex-col gap-2 sm:flex-row border-t pt-4">
//           <SheetClose asChild>
//             <Button variant="outline" className="w-full sm:w-auto">Close</Button>
//           </SheetClose>
//           <Button 
//             variant="outline" 
//             className="w-full sm:w-auto gap-2" 
//             asChild
//           >
//             <a href={`tel:${order.customer_phone}`}>
//               <Phone className="h-4 w-4" />
//               Call Customer
//             </a>
//           </Button>
//           <Button
//             className="w-full sm:w-auto gap-2"
//             variant={order.status === 'confirmed' ? 'secondary' : 'default'}
//             onClick={() => onStatusChange(order.id, nextStatus)}
//             disabled={updating}
//           >
//             {updating ? (
//               <RefreshCw className="h-4 w-4 animate-spin" />
//             ) : (
//               <ActionIcon className="h-4 w-4" />
//             )}
//             {actionLabel}
//           </Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   );
// };

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your orders in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={stats.total}
              description="All time orders"
              icon={ShoppingBag}
              className="border-l-4 border-l-primary"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              description="Awaiting confirmation"
              icon={Clock}
              className="border-l-4 border-l-amber-500"
            />
            <StatCard
              title="Confirmed"
              value={stats.confirmed}
              description="Ready for pickup"
              icon={CheckCircle}
              className="border-l-4 border-l-emerald-500"
            />
            <StatCard
              title="Revenue"
              value={`$${totalRevenue.toFixed(0)}`}
              description="Estimated total"
              icon={DollarSign}
              className="border-l-4 border-l-purple-500"
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  label=''
                  placeholder="Search customers, phone, or products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* <Tabs 
                  value={statusFilter} 
                  onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}
                  className="w-auto"
                >
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed" className="text-xs">Confirmed</TabsTrigger>
                  </TabsList>
                </Tabs> */}

                <Select 
                  value={`${sortConfig.key}-${sortConfig.direction}`}
                  onValueChange={(v) => {
                    const [key, direction] = v.split('-') as [typeof sortConfig.key, typeof sortConfig.direction];
                    setSortConfig({ key, direction });
                  }}
                >
                  <SelectTrigger className="h-9 w-auto text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest</SelectItem>
                    <SelectItem value="created_at-asc">Oldest</SelectItem>
                    <SelectItem value="total_price-desc">Price: High-Low</SelectItem>
                    <SelectItem value="total_price-asc">Price: Low-High</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant='outline' size='icon' className='h-9 w-9'>
                  <Filter className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}. Please try refreshing.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-12 text-center">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow 
                    key={order.id} 
                    onClick={() => handleRowClick(order)}
                    className='cursor-pointer'
                  >
                    <TableCell className="font-mono text-xs">#{order.id.slice(0, 6).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className='font-medium'>{order.customer_name}</div>
                      <div className='text-xs text-muted-foreground'>{order.customer_phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{order.product_name}</div>
                      <div className='text-xs text-muted-foreground'>{order.flavor}</div>
                    </TableCell>
                    <TableCell className="text-right font-bold">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table> */}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min(PAGE_SIZE * (page - 1) + 1, total)} - {Math.min(page * PAGE_SIZE, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">{page}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onStatusChange={handleToggleStatus}
          updating={updatingIds.has(selectedOrder.id)}
        />
      )} */}
    </DashboardLayout>
  );
}
