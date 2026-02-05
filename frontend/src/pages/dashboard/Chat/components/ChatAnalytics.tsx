/**
 * Chat Analytics Dashboard Component
 * Shows usage metrics, skill usage, and intent distribution
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useChatAnalytics } from '../../../../hooks/useChatAnalytics';
import { useSkills } from '../../../../hooks/useSkills';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Brain,
  Sparkles,
  FileSearch,
} from 'lucide-react';

interface ChatAnalyticsProps {
  days?: number;
}

// Intent labels and colors
const INTENT_CONFIG = {
  context_required: {
    label: 'Knowledge Search',
    color: '#4285F4',
    icon: FileSearch,
  },
  general_advice: {
    label: 'Direct Advice',
    color: '#34A853',
    icon: Brain,
  },
  skill_execution: {
    label: 'Skill Used',
    color: '#FBBC04',
    icon: Sparkles,
  },
};

export const ChatAnalytics: React.FC<ChatAnalyticsProps> = ({ days = 7 }) => {
  const { analytics, isLoading, error } = useChatAnalytics(days);
  const { skills } = useSkills();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
        <p>Unable to load analytics</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { summary, daily_breakdown, skill_usage, intent_distribution } = analytics;

  // Prepare skill usage data for bar chart
  const skillUsageData = Object.entries(skill_usage)
    .map(([skillId, count]) => {
      const skill = skills.find((s) => s.id === skillId);
      return {
        name: skill?.name || skillId,
        usage: count,
      };
    })
    .filter((d) => d.usage > 0)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5);

  // Prepare intent distribution for pie chart
  const intentData = Object.entries(intent_distribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: INTENT_CONFIG[key as keyof typeof INTENT_CONFIG]?.label || key,
      value,
      color: INTENT_CONFIG[key as keyof typeof INTENT_CONFIG]?.color || '#9E9E9E',
    }));

  const totalIntents = intentData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Messages */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Messages
            </span>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {summary.total_messages}
            </span>
            <div
              className={`flex items-center gap-0.5 text-xs font-bold ${
                summary.trend_positive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.trend_positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(summary.trend_percent)}%
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ~{summary.avg_messages_per_day} per day
          </p>
        </div>

        {/* Top Skill */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Most Used Skill
            </span>
            <Zap className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {summary.top_skill
              ? skills.find((s) => s.id === summary.top_skill)?.name || summary.top_skill
              : 'None yet'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.top_skill_count} uses this period
          </p>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chat Sessions
            </span>
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {summary.total_sessions}
          </div>
          <p className="text-xs text-slate-500 mt-1">Last {days} days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Message Volume</h3>
          <p className="text-xs text-slate-500 mb-4">Daily chat activity</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={daily_breakdown}>
              <defs>
                <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4285F4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => v.slice(5)} // Show MM-DD
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="#4285F4"
                strokeWidth={2}
                fill="url(#msgGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Query Routing</h3>
          <p className="text-xs text-slate-500 mb-4">How your questions are handled</p>
          {totalIntents > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={intentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {intentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {intentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">
                      {item.value} ({Math.round((item.value / totalIntents) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-gray-400 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Skill Usage */}
      {skillUsageData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Skill Usage</h3>
          <p className="text-xs text-slate-500 mb-4">Most popular skills this period</p>
          <ResponsiveContainer width="100%" height={Math.max(150, skillUsageData.length * 40)}>
            <BarChart data={skillUsageData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar
                dataKey="usage"
                fill="#FBBC04"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChatAnalytics;
