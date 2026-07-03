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

export interface CallLogStats {
  callsToday: number;
  callsTrend: string;
  callsTrendUp: boolean;
  missedCalls: number;
  handledRate: number;
  followUpCalls: number;
  avgDuration: string;
  total: number;
}

const buildCallLogParams = (filters: CallLogFilters & { customDate?: string }) => {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== 'All') {
    params.append('status', filters.status);
  }

  if (filters.type && filters.type !== 'All') {
    params.append('category', filters.type);
  }

  if (filters.search) {
    params.append('search', filters.search);
  }

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

  return params;
};

export function useCallLogs(filters: CallLogFilters & { customDate?: string }, page = 1, size = 4) {
  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery<{ items: RawCallLog[]; total: number; page: number; size: number }>({
    queryKey: ['call-logs', filters, page, size],
    queryFn: async ({ signal }) => {
      const headers = await getAuthHeader();

      const params = buildCallLogParams(filters);
      params.append('page', String(page));
      params.append('size', String(size));
      // Sort strictly by date (newest first). Keep this consistent with the
      // client-side sort below so server pagination stays in date order.
      params.append('attention_first', 'false');

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

  // Sort strictly by date, newest first.
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    loading: isLoading,
    isPlaceholderData,
    logs: sortedLogs,
    total: data?.total || 0,
    page: data?.page || page,
    size: data?.size || size,
    error: error instanceof Error ? error.message : null,
    refetch
  };
}

export function useCallLogStats(filters: CallLogFilters & { customDate?: string }) {
  const { data, isLoading, error, refetch } = useQuery<CallLogStats>({
    queryKey: ['call-log-stats', filters],
    queryFn: async ({ signal }) => {
      const headers = await getAuthHeader();
      const params = buildCallLogParams(filters);

      const response = await fetch(`${env.API_URL}/dashboard/calls/stats?${params.toString()}`, {
        headers,
        signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30000
  });

  return {
    loading: isLoading,
    stats: data,
    error: error instanceof Error ? error.message : null,
    refetch
  };
}
