import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { CallLog, CallLogFilters } from '../pages/dashboard/CallLogs/types';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

interface RawCallLog {
  id: string | number;
  caller_phone?: string;
  phone_number?: string;
  status: string;
  category?: string;
  duration_seconds?: number;
  created_at: string;
  [key: string]: unknown; // Allow for extra fields from API
}

export function useCallLogs(filters: CallLogFilters & { customDate?: string }) {
  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery<{ items: RawCallLog[] }>({
    queryKey: ['call-logs', filters],
    queryFn: async ({ signal }) => {
      const headers = await getAuthHeader();

      // Construct query parameters
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('size', '50'); // Fetch enough for the view

      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }

      if (filters.type && filters.type !== 'All') {
        params.append('category', filters.type);
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      // Date range handling
      if (filters.dateRange === 'Custom' && filters.customDate) {
        const startOfDay = new Date(filters.customDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.customDate);
        endOfDay.setHours(23, 59, 59, 999);

        params.append('start_date', startOfDay.toISOString());
        params.append('end_date', endOfDay.toISOString());
      } else if (filters.dateRange && filters.dateRange !== 'All' && filters.dateRange !== 'Custom') {
        const now = new Date();
        let startDate: Date | null = null;

        if (filters.dateRange === '24h') {
          startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        } else if (filters.dateRange === '7d') {
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        } else if (filters.dateRange === '30d') {
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        }

        if (startDate) {
          params.append('start_date', startDate.toISOString());
        }
      }

      const response = await fetch(`${env.API_URL}/dashboard/calls?${params.toString()}`, {
        headers,
        signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30000, // 30 seconds
  });

  const logs = (data?.items || []).map((item: RawCallLog) => ({
    ...item,
    phone_number: item.caller_phone || item.phone_number
  })) as CallLog[];

  return {
    loading: isLoading,
    isPlaceholderData,
    logs,
    error: error instanceof Error ? error.message : null,
    refetch
  };
}
