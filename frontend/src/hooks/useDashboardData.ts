import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

interface Call {
  id: number;
  created_at: string;
  is_urgent: boolean;
  status: string;
  caller_name: string;
  category: string;
  summary: string;
  follow_up_required?: boolean;
  phone_number?: string;
  caller_phone?: string;
}

interface Appointment {
  id: string | number;
  scheduled_at: string;
  customer_name: string;
  service_type: string;
}

interface ChartDataPoint {
  day: string;
  calls: number;
  active: boolean;
}

interface StatTrend {
  value: number;
  isPositive: boolean;
}

interface DashboardData {
  stats: {
    total: number;
    totalTrend?: StatTrend;
    urgent: number;
    urgentTrend?: StatTrend;
    handled: number;
    handledTrend?: StatTrend;
    missed: number;
    missedTrend?: StatTrend;
    minutesSaved: number;
    minutesSavedTrend?: StatTrend;
    appointmentsTrend?: StatTrend;
  };
  recentCalls: Call[];
  attentionCalls: Call[];
  appointments: Appointment[];
  chartData: ChartDataPoint[];
}

export const useDashboardData = (selectedDate: Date, days: number = 7, timezone: string = 'America/New_York') => {
  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data, isLoading, isPlaceholderData, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', dateStr, days, timezone],
    queryFn: async ({ signal }) => {
      const headers = await getAuthHeader();
      const response = await fetch(`${env.API_URL}/dashboard/stats?date=${selectedDate.toISOString()}&days=${days}&timezone=${timezone}`, {
        headers,
        signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const rawData = await response.json();
      const allCalls: Call[] = Array.isArray(rawData.recentCalls) ? rawData.recentCalls : [];
      return {
        stats: rawData.stats,
        recentCalls: allCalls.slice(0, 6),
        // Full-period urgent / follow-up items for the "Needs attention" queue.
        attentionCalls: allCalls.filter((c) => c.is_urgent || c.follow_up_required).slice(0, 5),
        appointments: Array.isArray(rawData.appointments) ? (rawData.appointments as Appointment[]).slice(0, 8) : [],
        chartData: Array.isArray(rawData.chartData) ? rawData.chartData : []
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Poll every minute
    placeholderData: keepPreviousData,
  });

  return {
    loading: isLoading,
    isPlaceholderData,
    stats: data?.stats || {
      total: 0,
      urgent: 0,
      handled: 0,
      missed: 0,
      minutesSaved: 0,
      totalTrend: { value: 0, isPositive: true },
      urgentTrend: { value: 0, isPositive: true },
      handledTrend: { value: 0, isPositive: true },
      missedTrend: { value: 0, isPositive: true },
      minutesSavedTrend: { value: 0, isPositive: true },
      appointmentsTrend: { value: 0, isPositive: true }
    },
    recentCalls: data?.recentCalls || [],
    attentionCalls: data?.attentionCalls || [],
    appointments: data?.appointments || [],
    chartData: data?.chartData || [],
    error
  };
};
