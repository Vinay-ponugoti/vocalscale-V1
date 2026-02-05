/**
 * Hook for chat analytics
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../context/AuthContext';

export function useChatAnalytics(days: number = 7) {
  const { user } = useAuth();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-analytics', days],
    queryFn: () => analyticsApi.getChatAnalytics(days),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  return {
    analytics,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
