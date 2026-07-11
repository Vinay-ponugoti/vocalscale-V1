import { env } from '../config/env';
import { getAuthHeader } from '../lib/api';

export interface InsightsSummary {
  total_calls: number;
  answered: number;
  missed: number;
  answered_rate: number;
  bookings: number;
  booking_rate: number;
  minutes_handled: number;
  avg_duration_seconds: number;
  follow_ups: number;
  urgent: number;
}

export interface CountPair {
  count: number;
  outcome?: string;
  sentiment?: string;
  category?: string;
  direction?: string;
}

export interface DayPoint {
  date: string;
  answered: number;
  missed: number;
  total: number;
}

export interface HourPoint {
  hour: number;
  count: number;
}

export interface CallInsights {
  period_days: number;
  summary: InsightsSummary;
  outcomes: CountPair[];
  sentiment: CountPair[];
  categories: CountPair[];
  directions: CountPair[];
  by_day: DayPoint[];
  by_hour: HourPoint[];
}

class InsightsAPI {
  async getCallInsights(days = 30): Promise<CallInsights> {
    const headers = await getAuthHeader();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const response = await fetch(
      `${env.API_URL}/dashboard/insights?days=${days}&timezone=${encodeURIComponent(timezone)}`,
      { headers },
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.detail || error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }
}

export const insightsAPI = new InsightsAPI();
