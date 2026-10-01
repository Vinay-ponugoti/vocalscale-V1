import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneMissed, Calendar, AlertTriangle, Star } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import { StatCard } from '../ui/StatCard';
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

const StatsGrid: React.FC<StatsGridProps> = ({ stats, appointmentsCount, reviewsCount, reviewsToday, reviewRating, reviewsTrend }) => {
  const navigate = useNavigate();

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5', GRID_GAP)}>
      <StatCard
        label="Total calls"
        value={stats.total}
        icon={Phone}
        trend={stats.totalTrend}
        description="Recorded in period"
        onClick={() => navigate('/dashboard/calls')}
      />
      <StatCard
        label="Missed calls"
        value={stats.missed ?? 0}
        icon={PhoneMissed}
        trend={stats.missedTrend}
        trendSuffix=""
        tint="rose"
        description={(stats.missed ?? 0) > 0 ? 'Potential lost revenue' : 'None missed'}
        onClick={() => navigate('/dashboard/calls')}
      />
      <StatCard
        label="Appointments"
        value={appointmentsCount}
        icon={Calendar}
        trend={stats.appointmentsTrend}
        tint="emerald"
        description="Upcoming in period"
        onClick={() => navigate('/dashboard/appointments')}
      />
      <StatCard
        label="Needs attention"
        value={stats.urgent}
        icon={AlertTriangle}
        trend={stats.urgentTrend}
        tint="orange"
        description="Calls to follow up"
        onClick={() => navigate('/dashboard/calls')}
      />
      <StatCard
        label="Reviews"
        value={reviewRating.toFixed(1)}
        icon={Star}
        trend={reviewsTrend}
        tint="amber"
        description={`${reviewsCount} total · ${reviewsToday} today`}
        footer={<StarRating rating={reviewRating} size={12} />}
        onClick={() => navigate('/dashboard/reviews')}
      />
    </div>
  );
};

export default StatsGrid;
