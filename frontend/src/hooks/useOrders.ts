import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ordersApi, type Order, type OrderStats } from '../api/orders';
import type { OrderStatus } from '@/types/orders';

export function useOrders(statusFilter: OrderStatus, page: number) {
  const queryClient = useQueryClient();

  // Fetch orders — for 'confirmed' we merge pending+confirmed
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isPlaceholderData,
    error: ordersError,
  } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: async () => {
      if (statusFilter === 'confirmed') {
        const [pendingRes, confirmedRes] = await Promise.all([
          ordersApi.getOrders(1, 100, 'pending'),
          ordersApi.getOrders(1, 100, 'confirmed'),
        ]);
        const orders = [...(pendingRes.orders || []), ...(confirmedRes.orders || [])];
        const total = (pendingRes.total || 0) + (confirmedRes.total || 0);
        return { orders, total };
      }
      const res = await ordersApi.getOrders(page, 20, 'cancelled');
      return { orders: res.orders || [], total: res.total || 0 };
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  // Fetch stats in parallel (separate query = independent cache)
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => ordersApi.getOrderStats(),
    staleTime: 60_000,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      ordersApi.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Compute revenue from loaded orders if backend returns 0
  const enrichedStats: OrderStats | null = stats && ordersData
    ? (() => {
        const calculatedRevenue = ordersData.orders.reduce(
          (sum, o) => sum + (o.total_price || (o.unit_price || 0) * o.quantity),
          0,
        );
        return {
          ...stats,
          revenue: stats.revenue || calculatedRevenue,
        };
      })()
    : stats ?? null;

  return {
    orders: ordersData?.orders ?? [],
    total: ordersData?.total ?? 0,
    stats: enrichedStats,
    loading: ordersLoading,
    statsLoading,
    isPlaceholderData,
    error: ordersError instanceof Error ? ordersError.message : null,
    updateStatus: (orderId: string, newStatus: OrderStatus) =>
      statusMutation.mutateAsync({ orderId, newStatus }),
    updatingId: statusMutation.isPending ? (statusMutation.variables?.orderId ?? null) : null,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
  };
}
