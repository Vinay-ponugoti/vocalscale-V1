import { useQuery } from '@tanstack/react-query';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface NotificationCall {
  id: string;
  caller_name: string;
  caller_phone: string;
  created_at: string;
  summary: string;
  category: string;
  notes?: string;
}

export function useNotifications() {
  const { data, isLoading, refetch } = useQuery<NotificationCall[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/dashboard/notifications`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const dismissNotification = async (id: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/dashboard/notifications/${id}/dismiss`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Invalidate and refetch
      refetch();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  return {
    loading: isLoading,
    notifications: data || [],
    unreadCount: data?.length || 0,
    dismissNotification,
    refresh: refetch
  };
}
