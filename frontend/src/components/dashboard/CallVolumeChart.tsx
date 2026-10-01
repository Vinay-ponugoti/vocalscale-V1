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
import { TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    label: "Calls",
    color: "hsl(var(--chart-1))",
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
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col pt-0">
      <CardHeader className="flex flex-col gap-3 space-y-0 p-4 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Activity size={15} />
            </span>
            <CardTitle className="text-sm font-semibold text-slate-900">Call volume</CardTitle>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-3 pl-9 text-xs text-slate-500">
            <span>
              {totalCalls} {totalCalls === 1 ? 'call' : 'calls'} over {safeData.length} {safeData.length === 1 ? 'day' : 'days'}
            </span>
            <Link
              to="/dashboard/insights"
              className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:text-blue-700"
            >
              View full performance <ArrowRight size={12} />
            </Link>
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          {trend && (
            <div className={cn(
              "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.value}% vs previous
            </div>
          )}

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[140px] rounded-lg text-xs font-medium border-slate-200"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {/* Quick Stats Integration - Tightened Gap */}
        <div className="flex items-center gap-8 mb-3 px-2 pt-1">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total calls</span>
            <span className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tighter">{totalCalls}</span>
          </div>
          <div className="h-10 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Average</span>
            <span className="text-3xl font-semibold text-slate-900 tabular-nums tracking-tighter">
              {safeData.length > 0 ? (totalCalls / safeData.length).toFixed(1) : 0}
            </span>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[230px] w-full sm:h-[250px] min-h-0"
        >
          <AreaChart data={safeData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-calls)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-calls)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgb(var(--twc-slate-100))" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={60}
              interval="preserveStartEnd"
              padding={{ left: 0, right: 0 }}
              tickFormatter={(value) => {
                // Return simpler labels to "remove excess"
                if (typeof value === 'string' && value.includes(',')) return value.split(',')[0];
                return value;
              }}
              tick={{ fill: 'rgb(var(--twc-slate-400))', fontSize: 10, fontWeight: 700 }}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgb(var(--twc-slate-200))', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="calls"
              type="monotone"
              fill="url(#fillCalls)"
              stroke="var(--color-calls)"
              strokeWidth={3}
              stackId="a"
              animationDuration={1000}
              isAnimationActive={true}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CallVolumeChart;
