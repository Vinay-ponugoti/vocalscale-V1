import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/Chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select"
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const chartConfig = {
  calls: {
    label: "Total Calls",
    color: "#0f172a",
  },
} satisfies ChartConfig

const CallVolumeChart: React.FC<CallVolumeChartProps> = ({ data, timeRange, setTimeRange, trend }) => {
  const safeData = React.useMemo(() =>
    (Array.isArray(data) ? data : []).map(d => ({
      date: d.day,
      calls: d.calls
    })),
    [data]);

  const totalCalls = safeData.reduce((sum, d) => sum + d.calls, 0);

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row px-6">
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-900 ring-1 ring-slate-900/5">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <CardTitle className="text-base font-black text-slate-900 uppercase tracking-tight">Call Volume</CardTitle>
          </div>
          <CardDescription className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Displaying {safeData.length} records for the current period
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          {trend && (
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest",
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.value}% Trend
            </div>
          )}

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[140px] rounded-xl text-[11px] font-black uppercase tracking-tight border-slate-200"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 min-h-[350px]">
        {/* Quick Stats Integration */}
        <div className="flex items-center gap-8 mb-6 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Interactions</span>
            <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">{totalCalls}</span>
          </div>
          <div className="h-10 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Avg per Period</span>
            <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">
              {safeData.length > 0 ? (totalCalls / safeData.length).toFixed(1) : 0}
            </span>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={safeData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-calls)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-calls)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => {
                // If the value is just a day name or date, we use it as is
                return value;
              }}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <ChartTooltip
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="calls"
              type="natural"
              fill="url(#fillCalls)"
              stroke="var(--color-calls)"
              strokeWidth={2.5}
              stackId="a"
              animationDuration={1500}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CallVolumeChart;
