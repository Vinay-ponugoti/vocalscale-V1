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
import { Badge } from '../ui/Badge';
import { TrendingUp, TrendingDown, Phone, ArrowUpRight } from 'lucide-react';

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

interface TooltipPayload {
  value: number;
  payload: ChartDataPoint;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-white-light shadow-xl rounded-2xl ring-1 ring-charcoal/5">
        <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-electric" />
          <p className="text-xl font-black text-charcoal tracking-tight">
            {payload[0].value} <span className="text-xs font-bold text-charcoal-light ml-1">Calls</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CallVolumeChart: React.FC<CallVolumeChartProps> = ({ data, timeRange, setTimeRange, trend }) => {
  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0);
  const avgCalls = data.length > 0 ? (totalCalls / data.length).toFixed(1) : 0;
  const peakCalls = Math.max(...data.map(d => d.calls));

  return (
    <Card className="border-white-light shadow-sm overflow-hidden group">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-electric/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-electric" />
              </div>
              <CardTitle className="text-base font-black text-charcoal tracking-tight uppercase">Call Volume</CardTitle>
            </div>
            <p className="text-[11px] font-bold text-charcoal-light uppercase tracking-widest pl-10">Real-time engagement metrics</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white-light p-1 rounded-xl border border-white-light">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeRange === range
                      ? 'bg-white text-blue-electric shadow-sm scale-100 ring-1 ring-charcoal/5'
                      : 'text-charcoal-light hover:text-charcoal-medium hover:bg-white/50 scale-95 hover:scale-100'
                    }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-white-light hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest">Peak</p>
                <p className="text-sm font-black text-charcoal">{peakCalls}</p>
              </div>
              {trend && (
                <Badge variant="secondary" className={`${trend.isPositive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  } font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none`}>
                  {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F7FA" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="calls"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#callGradient)"
                animationDuration={2000}
                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white-light">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest">Daily Average</p>
            <p className="text-xl font-black text-charcoal tracking-tight">{avgCalls}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest">Total Handling</p>
            <p className="text-xl font-black text-charcoal tracking-tight">{totalCalls}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallVolumeChart;
