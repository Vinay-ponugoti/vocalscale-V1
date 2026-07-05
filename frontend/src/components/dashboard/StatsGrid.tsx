import React from 'react';
import { Phone, Calendar, AlertTriangle, Star, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
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
  reviewsCount: number;
  reviewsToday: number;
  reviewRating: number;
  reviewsTrend?: {
    value: number;
    isPositive: boolean;
  };
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
    <Card className={`relative flex h-full min-h-[154px] flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-colors duration-200 hover:border-slate-300 hover:shadow-sm ${highlight ? 'bg-orange-50/30' : 'bg-white'
      }`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="text-[12px] font-black text-charcoal-light tracking-[0.12em] uppercase leading-5">{label}</CardTitle>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${highlight ? 'bg-orange-50 text-orange-600' : 'bg-blue-electric/10 text-blue-electric'
          }`}>
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal">{value}</span>
            {trend && (
              <div className={`flex shrink-0 items-center gap-0.5 text-xs font-black ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
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

          <div className="mt-2 flex min-h-6 items-center justify-between gap-3">
            <p className="min-w-0 text-[11px] font-bold text-charcoal-light uppercase tracking-wider">{description || 'Total recorded'}</p>
            {badge ? (
              <Badge variant={badge.variant} className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase">
                {badge.text}
              </Badge>
            ) : highlight ? (
              <Badge variant="destructive" className="shrink-0 rounded-md border-none bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase text-orange-600 hover:bg-orange-100">
                Priority
              </Badge>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ReviewStatCardProps {
  totalReviews: number;
  reviewsToday: number;
  rating: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const ReviewStatCard: React.FC<ReviewStatCardProps> = ({ totalReviews, reviewsToday, rating, trend }) => {
  return (
    <Card className="relative flex h-full min-h-[154px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors duration-200 hover:border-slate-300 hover:shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="text-[12px] font-black text-charcoal-light tracking-[0.12em] uppercase leading-5">Reviews</CardTitle>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
          <Star className="h-4 w-4" strokeWidth={2.25} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-charcoal">{rating.toFixed(1)}</span>
            {trend && (
              <div className={`flex shrink-0 items-center gap-0.5 text-xs font-black ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
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

          <StarRating rating={rating} size={15} className="min-h-[18px]" />

          <div className="mt-1 flex min-h-6 items-center justify-between gap-3">
            <p className="min-w-0 text-[11px] font-bold text-charcoal-light uppercase tracking-wider">{totalReviews} total</p>
            <Badge variant="outline" className="shrink-0 rounded-md border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
              {reviewsToday} Today
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats, appointmentsCount, reviewsCount, reviewsToday, reviewRating, reviewsTrend }) => {
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
        description="Scheduled in period"
      />
      <StatCard
        label="Urgent Alerts"
        value={stats.urgent}
        icon={AlertTriangle}
        trend={stats.urgentTrend}
        highlight
        description="Requires attention"
      />
      <ReviewStatCard
        totalReviews={reviewsCount}
        reviewsToday={reviewsToday}
        rating={reviewRating}
        trend={reviewsTrend}
      />
    </div>
  );
};

export default StatsGrid;
