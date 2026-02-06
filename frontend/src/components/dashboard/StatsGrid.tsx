import React from 'react';
import { Phone, Calendar, AlertTriangle, Clock, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { GRID_GAP } from '../../constants/layout';

interface StatsGridProps {
  stats: {
    total: number;
    totalTrend?: { value: number; isPositive: boolean };
    urgent: number;
    urgentTrend?: { value: number; isPositive: boolean };
    handled: number;
    handledTrend?: { value: number; isPositive: boolean };
    minutesSaved?: number;
    minutesSavedTrend?: { value: number; isPositive: boolean };
    appointmentsTrend?: { value: number; isPositive: boolean };
  };
  appointmentsCount: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  highlight?: boolean;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  badge,
  highlight,
  description
}) => {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-white-light shadow-sm ${highlight ? 'ring-2 ring-orange-500/20' : ''
      }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-charcoal-light tracking-tight uppercase">{label}</CardTitle>
        <div className={`p-2 rounded-xl ${highlight ? 'bg-orange-50 text-orange-600' : 'bg-blue-electric/10 text-blue-electric'
          }`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal tracking-tighter">{value}</span>
            {trend && (
              <div className={`flex items-center gap-0.5 text-xs font-black ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] font-bold text-charcoal-light uppercase tracking-wider">{description || 'Total recorded'}</p>
            {badge ? (
              <Badge variant={badge.variant} className="font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                {badge.text}
              </Badge>
            ) : highlight ? (
              <Badge variant="destructive" className="bg-orange-100 text-orange-600 hover:bg-orange-100 font-black text-[10px] uppercase px-2 py-0.5 rounded-md border-none">
                Priority
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats, appointmentsCount }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4", GRID_GAP)}>
      <StatCard
        label="Total Calls"
        value={stats.total}
        icon={Phone}
        trend={stats.totalTrend}
        description="Recorded in period"
      />
      <StatCard
        label="Appointments"
        value={appointmentsCount}
        icon={Calendar}
        trend={stats.appointmentsTrend}
        badge={{ text: 'Upcoming', variant: 'secondary' }}
        description="Scheduled via AI"
      />
      <StatCard
        label="Urgent Alerts"
        value={stats.urgent}
        icon={AlertTriangle}
        trend={stats.urgentTrend}
        highlight
        description="Requires attention"
      />
      <StatCard
        label="Time Saved"
        value={`${Math.round(stats.minutesSaved || 0)}m`}
        icon={Clock}
        trend={stats.minutesSavedTrend}
        badge={{ text: 'Efficiency', variant: 'outline' }}
        description="AI Automation"
      />
    </div>
  );
};

export default StatsGrid;