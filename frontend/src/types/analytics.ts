/**
 * Chat Analytics types for the dashboard
 */

export interface AnalyticsSummary {
  total_messages: number;
  total_sessions: number;
  avg_messages_per_day: number;
  trend_percent: number;
  trend_positive: boolean;
  top_skill: string | null;
  top_skill_count: number;
}

export interface DailyMetric {
  date: string;
  messages: number;
}

export interface ChatAnalytics {
  summary: AnalyticsSummary;
  daily_breakdown: DailyMetric[];
  skill_usage: Record<string, number>;
  intent_distribution: Record<string, number>;
  period_days: number;
}
