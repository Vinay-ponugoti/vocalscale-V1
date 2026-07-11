import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneMissed, Calendar, AlertTriangle, Star, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
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

interface StatTrend {
  value: number;
  isPositive: boolean;
}

interface StatsGridProps {
  stats: {
    total: number;
    totalTrend?: StatTrend;
    urgent: number;
    urgentTrend?: StatTrend;
    handled: number;
    handledTrend?: StatTrend;
    missed?: number;
    missedTrend?: StatTrend;
    minutesSaved?: number;
    minutesSavedTrend?: StatTrend;
    appointmentsTrend?: StatTrend;
  };
  appointmentsCount: number;
  reviewsCount: number;
  reviewsToday: number;
  reviewRating: number;
  reviewsTrend?: StatTrend;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: StatTrend;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  tint?: 'blue' | 'rose' | 'amber' | 'orange' | 'emerald';
  description?: string;
  onClick?: () => void;
  /** Suffix after the trend number; '%' by default, '' for absolute deltas. */
  trendSuffix?: string;
}

const ICON_TINTS: Record<NonNullable<StatCardProps['tint']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-500',
  orange: 'bg-orange-50 text-orange-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  badge,
  tint = 'blue',
  description,
  onClick,
  trendSuffix = '%',
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative flex h-full min-h-[116px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:border-slate-200',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-1.5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 leading-5">{label}</CardTitle>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', ICON_TINTS[tint])}>
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end px-4 pb-4 pt-0">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] leading-none font-semibold tracking-tight text-slate-900">{value}</span>
            {trend && (
              <div
                className={cn(
                  'flex shrink-0 items-center gap-0.5 text-xs font-semibold',
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(trend.value)}{trendSuffix}</span>
              </div>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="min-w-0 text-[11px] font-medium text-slate-400">{description || 'Total recorded'}</p>
            {badge && (
              <Badge variant={badge.variant} className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase">
                {badge.text}
              </Badge>
            )}
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
  trend?: StatTrend;
}

const ReviewStatCard: React.FC<ReviewStatCardProps> = ({ totalReviews, reviewsToday, rating, trend }) => {
  return (
    <Card className="relative flex h-full min-h-[116px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:border-slate-200">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-1.5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500 leading-5">Reviews</CardTitle>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', ICON_TINTS.amber)}>
          <Star className="h-4 w-4" strokeWidth={2.25} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end px-4 pb-4 pt-0">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] leading-none font-semibold tracking-tight text-slate-900">{rating.toFixed(1)}</span>
            {trend && (
              <div
                className={cn(
                  'flex shrink-0 items-center gap-0.5 text-xs font-semibold',
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>

          <div className="mt-1 flex min-h-6 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <StarRating rating={rating} size={13} />
              <span className="truncate text-[11px] font-medium text-slate-400">{totalReviews} total</span>
            </div>
            <Badge variant="outline" className="shrink-0 rounded-md border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
              {reviewsToday} Today
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats, appointmentsCount, reviewsCount, reviewsToday, reviewRating, reviewsTrend }) => {
  const navigate = useNavigate();

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5', GRID_GAP)}>
      <StatCard
        label="Total Calls"
        value={stats.total}
        icon={Phone}
        trend={stats.totalTrend}
        description="Recorded in period"
        onClick={() => navigate('/dashboard/calls')}
      />
      <StatCard
        label="Missed Calls"
        value={stats.missed ?? 0}
        icon={PhoneMissed}
        trend={stats.missedTrend}
        trendSuffix=""
        tint="rose"
        description={(stats.missed ?? 0) > 0 ? 'Potential lost revenue' : 'Nothing slipped through'}
        onClick={() => navigate('/dashboard/calls')}
      />
      <StatCard
        label="Appointments"
        value={appointmentsCount}
        icon={Calendar}
        trend={stats.appointmentsTrend}
        tint="emerald"
        badge={{ text: 'Upcoming', variant: 'secondary' }}
        description="Scheduled in period"
        onClick={() => navigate('/dashboard/appointments')}
      />
      <StatCard
        label="Urgent Alerts"
        value={stats.urgent}
        icon={AlertTriangle}
        trend={stats.urgentTrend}
        tint="orange"
        description="Requires attention"
        onClick={() => navigate('/dashboard/calls')}
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
