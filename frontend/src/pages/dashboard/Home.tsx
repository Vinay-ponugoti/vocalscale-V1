import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useDashboardData } from '../../hooks/useDashboardData';
import { subDays, addDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useBusinessSetup } from '../../context/BusinessSetupContext';
// FloatingChat removed

// Import sub-components
import StatsGrid from '../../components/dashboard/StatsGrid';
import CallVolumeChart from '../../components/dashboard/CallVolumeChart';
import RecentTranscripts from '../../components/dashboard/RecentTranscripts';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import CalendarPicker from '../../components/dashboard/CalendarPicker';
import StatusStrip from '../../components/dashboard/StatusStrip';
import SetupChecklist from '../../components/dashboard/SetupChecklist';
import NeedsAttention from '../../components/dashboard/NeedsAttention';
import UpcomingAppointments from '../../components/dashboard/UpcomingAppointments';
import { PAGE_CONTAINER } from '../../constants/layout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { reviewApi } from '../../api/reviewApi';

const Home = () => {
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';

  // Use a helper to get "today" in the business timezone
  const getBusinessToday = () => toZonedTime(new Date(), timezone);

  const [selectedDate, setSelectedDate] = useState(getBusinessToday());
  const [timeRange, setTimeRange] = useState('7d');
  const [reviewSummary, setReviewSummary] = useState({
    totalReviews: 0,
    reviewsToday: 0,
    rating: 0,
    trend: { value: 0, isPositive: true }
  });

  const businessTodayStr = getBusinessToday().toDateString();
  const isBusinessToday = selectedDate.toDateString() === businessTodayStr;

  // Map timeRange string to numeric days for the API
  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '24h': return 1;
      case '30d': return 30;
      default: return 7;
    }
  }, [timeRange]);

  const { loading, isPlaceholderData, stats, recentCalls, attentionCalls, appointments, chartData } = useDashboardData(selectedDate, daysCount, timezone);

  const businessName = state.data.business.business_name?.trim();
  const greeting = useMemo(() => {
    const hour = toZonedTime(new Date(), timezone).getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [timezone]);

  useEffect(() => {
    let isMounted = true;

    const loadReviewStats = async () => {
      try {
        const reviewStats = await reviewApi.getStats(daysCount);
        if (!isMounted) return;

        const trendValue = reviewStats.trends?.reviews || 0;
        const todayVolume = reviewStats.reviewVolume?.[reviewStats.reviewVolume.length - 1];
        setReviewSummary({
          totalReviews: reviewStats.totalReviews || 0,
          reviewsToday: todayVolume?.reviews || 0,
          rating: reviewStats.overallRating || 0,
          trend: {
            value: Math.abs(trendValue),
            isPositive: trendValue >= 0
          }
        });
      } catch (error) {
        console.error('Failed to load dashboard review stats:', error);
        if (isMounted) {
          setReviewSummary({
            totalReviews: 0,
            reviewsToday: 0,
            rating: 0,
            trend: { value: 0, isPositive: true }
          });
        }
      }
    };

    loadReviewStats();

    return () => {
      isMounted = false;
    };
  }, [daysCount]);

  const handlePrev = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNext = () => {
    if (!isBusinessToday) setSelectedDate(prev => addDays(prev, 1));
  };

  const isInitialLoading = loading && !isPlaceholderData;

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
        <PageHeader
          title={
            <>
              {greeting}
              {businessName ? <span className="text-slate-400"> — {businessName}</span> : ''}
            </>
          }
          meta={isPlaceholderData && (
            <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              <Clock size={12} />
              Updating…
            </span>
          )}
          description="Calls, appointments, and follow-ups your agent handled."
          actions={
            <>
              <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous day">
                <ArrowLeft size={16} />
              </Button>
              <CalendarPicker
                date={selectedDate}
                setDate={(date) => setSelectedDate(toZonedTime(date, timezone))}
                maxDate={toZonedTime(new Date(), timezone)}
              />
              <Button variant="outline" size="icon" onClick={handleNext} disabled={isBusinessToday} aria-label="Next day">
                <ArrowRight size={16} />
              </Button>
            </>
          }
        />

        {/* --- Live status: number, agent, minutes --- */}
        <StatusStrip />

        {/* --- First-run setup checklist (self-hides when complete) --- */}
        <SetupChecklist />

        {isInitialLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* --- Stats Grid --- */}
            <div className="w-full">
              <StatsGrid
                stats={stats}
                appointmentsCount={appointments.length}
                reviewsCount={reviewSummary.totalReviews}
                reviewsToday={reviewSummary.reviewsToday}
                reviewRating={reviewSummary.rating}
                reviewsTrend={reviewSummary.trend}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:gap-6 xl:grid-cols-3">

              {/* --- LEFT: CHART --- */}
              <div className="min-w-0 xl:col-span-2">

                {/* Real Chart */}
                <CallVolumeChart
                  data={chartData}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  trend={stats.totalTrend}
                />
              </div>

              {/* --- RIGHT: ACTION QUEUE, TRANSCRIPTS, APPOINTMENTS --- */}
              <div className="min-w-0 space-y-4 lg:space-y-6">
                <NeedsAttention calls={attentionCalls} />
                <RecentTranscripts calls={recentCalls} />
                <UpcomingAppointments appointments={appointments} />
              </div>

            </div>

          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Home;
