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
    <Card className="border-slate-100 bg-white shadow-sm overflow-hidden h-full flex flex-col outline-none focus:outline-none select-none" tabIndex={-1}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-slate-50">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Activity size={14} />
            </div>
            Call Activity
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-medium text-slate-700">{totalCalls.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-wide font-medium text-slate-400">Total</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-medium text-slate-700">{peakCalls.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-wide font-medium text-slate-400">Peak</span>
            </div>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-50 rounded-lg border border-slate-100">
          {['24h', '7d', '30d'].map((range) => (
            <CustomTab
              key={range}
              label={range}
              isActive={timeRange === range}
              onClick={() => setTimeRange(range)}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-6 px-1">
        <div className="h-full w-full min-h-[200px] max-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
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
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCalls)"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-t border-slate-50 mt-2">
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Avg</p>
              <p className="text-lg font-mono font-bold text-slate-700">{avgCalls}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handling</p>
              <p className="text-lg font-mono font-bold text-slate-700">{totalCalls}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trend && (
              <div className={cn(
                "flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {trend.isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {trend.value}%
                <span className="ml-1 opacity-70">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallVolumeChart;
