/**
 * Chat Analytics Tab
 * Shows real usage stats, daily breakdown chart, and conversation insights
 */

import React, { useState } from 'react';
import {
  BarChart3, MessageSquare, CalendarDays, TrendingUp, TrendingDown,
  Loader2, RefreshCw, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useChatAnalytics } from '../../../../hooks/useChatAnalytics';

const PERIOD_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

const ChatAnalytics: React.FC = () => {
  const [days, setDays] = useState(7);
  const { analytics, isLoading, error, refetch } = useChatAnalytics(days);

  const summary = analytics?.summary;
  const daily = analytics?.daily_breakdown ?? [];
  const intentDist = analytics?.intent_distribution ?? {};

  // Calculate the max message count for bar chart scaling
  const maxMessages = Math.max(...daily.map(d => d.messages), 1);

  // Sum messages in the selected period (from daily breakdown)
  const periodTotal = daily.reduce((sum, d) => sum + d.messages, 0);

  // ── Loading State ──
  if (isLoading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <Loader2 size={28} className="text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading analytics...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <BarChart3 size={24} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to load analytics</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-xs">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  // ── Empty State ──
  if (!analytics || (summary?.total_messages === 0 && periodTotal === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <BarChart3 size={28} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">No Data Yet</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Start using AI chat and analytics will appear here automatically.
        </p>
      </div>
    );
  }

  // ── Stat Cards ──
  const stats = [
    {
      label: 'Total Messages',
      value: summary?.total_messages ?? 0,
      icon: MessageSquare,
      color: 'indigo',
    },
    {
      label: `Last ${days} Days`,
      value: periodTotal,
      icon: CalendarDays,
      color: 'violet',
    },
    {
      label: 'Sessions',
      value: summary?.total_sessions ?? 0,
      icon: Zap,
      color: 'amber',
    },
    {
      label: 'Avg / Day',
      value: summary?.avg_messages_per_day ?? 0,
      icon: summary?.trend_positive ? TrendingUp : TrendingDown,
      color: summary?.trend_positive ? 'emerald' : 'rose',
      trend: summary?.trend_percent,
      trendPositive: summary?.trend_positive,
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-500',  badge: 'bg-indigo-100 text-indigo-700' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-500',  badge: 'bg-violet-100 text-violet-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   badge: 'bg-amber-100 text-amber-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    rose:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    badge: 'bg-rose-100 text-rose-700' },
  };

  // Format day label for chart — show short weekday or date
  const formatDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (days <= 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">

      {/* ── Top Bar: Period Selector + Refresh ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Chat Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  days === opt.value
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const c = colorMap[stat.color] || colorMap.indigo;
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon size={16} className={c.icon} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <span className={`flex items-center gap-0.5 text-[11px] font-bold mb-1 ${
                    stat.trendPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stat.trendPositive
                      ? <ArrowUpRight size={12} />
                      : <ArrowDownRight size={12} />
                    }
                    {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Daily Breakdown Bar Chart ── */}
      {daily.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Daily Messages</h3>
          <div className="flex items-end gap-1.5" style={{ height: 140 }}>
            {daily.map((d, i) => {
              const heightPercent = maxMessages > 0 ? (d.messages / maxMessages) * 100 : 0;
              const isToday = i === daily.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Count label on hover */}
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.messages}
                  </span>
                  {/* Bar */}
                  <div className="w-full flex items-end" style={{ height: 100 }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isToday ? 'bg-indigo-500' : 'bg-indigo-200 group-hover:bg-indigo-400'
                      }`}
                      style={{
                        height: `${Math.max(heightPercent, d.messages > 0 ? 4 : 0)}%`,
                        minHeight: d.messages > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  {/* Day label */}
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    isToday ? 'text-indigo-600' : 'text-slate-400'
                  }`}>
                    {formatDayLabel(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Intent Distribution ── */}
      {Object.keys(intentDist).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Query Types</h3>
          <div className="space-y-2">
            {Object.entries(intentDist)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([intent, count]) => {
                const totalIntents = Object.values(intentDist).reduce((s, c) => s + c, 0);
                const pct = totalIntents > 0 ? Math.round((count / totalIntents) * 100) : 0;
                const label = intent
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <div key={intent}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                      <span className="text-[11px] font-bold text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Top Skill ── */}
      {summary?.top_skill && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Zap size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Most Used Skill</p>
            <p className="text-sm font-bold text-slate-900">
              {summary.top_skill.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              <span className="text-slate-400 font-medium ml-2">({summary.top_skill_count} uses)</span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatAnalytics;
