import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Inject global styles to suppress Recharts focus outline (Moved to index.css)

interface ChartDataPoint {
  day: string;
  calls: number;
  active: boolean;
}

interface CallVolumeChartProps {
  data: ChartDataPoint[];
  timeRange: string;
  setTimeRange: (range: string) => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-white/10 text-xs backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-slate-400 font-medium">{label}</span>
          <Activity className="w-3 h-3 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono tracking-tight">{payload[0].value}</span>
          <span className="text-slate-400 font-medium">calls</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTab = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-md",
      isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-white shadow-sm ring-1 ring-slate-100 rounded-md"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10">{label}</span>
  </button>
);

const CallVolumeChart: React.FC<CallVolumeChartProps> = ({ data, timeRange, setTimeRange, trend }) => {
  const safeData = Array.isArray(data) ? data : [];
  const totalCalls = safeData.reduce((sum, d) => sum + d.calls, 0);
  const avgCalls = safeData.length > 0 ? (totalCalls / safeData.length).toFixed(1) : 0;

  // Calculate max for Y-axis domain padding
  const maxCalls = Math.max(...safeData.map(d => d.calls), 0);
  const peakCalls = Math.max(...safeData.map(d => d.calls), 0);

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col" tabIndex={-1}>
      <CardHeader className="flex flex-col space-y-4 pb-4 border-b border-slate-100">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900">Call Activity</CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Last {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}</p>
            </div>
          </div>

          {/* Time Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
            {['24h', '7d', '30d'].map((range) => (
              <CustomTab
                key={range}
                label={range}
                isActive={timeRange === range}
                onClick={() => setTimeRange(range)}
              />
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{totalCalls}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Calls</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{peakCalls}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Peak Day</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{avgCalls}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Daily Avg</span>
          </div>
          {trend && (
            <>
              <div className="h-8 w-px bg-slate-200" />
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold",
                trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}>
                {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {trend.value}%
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-4 px-4 pb-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                hide={true}
                domain={[0, Math.ceil(maxCalls * 1.1)]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
              />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="#6366F1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCalls)"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallVolumeChart;
