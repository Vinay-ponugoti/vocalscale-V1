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
import { PAGE_PADDING } from '../../constants/layout';
import { cn } from '../../lib/utils';
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
    <DashboardLayout fullWidth>
      <div className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full space-y-5", PAGE_PADDING)}>

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {greeting}
                {businessName ? <span className="text-slate-400"> — {businessName}</span> : ''}
              </h1>
              {isPlaceholderData && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                  <Clock size={12} className="animate-spin-slow" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Updating...</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Call coverage, bookings, and follow-up for your phone desk.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Navigation Controls */}
            <button
              onClick={handlePrev}
              className="p-2 bg-white border border-white-light text-charcoal-medium rounded-lg hover:bg-white-light hover:text-charcoal transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>

            {/* Custom Calendar Picker */}
            <CalendarPicker
              date={selectedDate}
              setDate={(date) => setSelectedDate(toZonedTime(date, timezone))}
              maxDate={toZonedTime(new Date(), timezone)}
            />

            <button
              onClick={handleNext}
              disabled={isBusinessToday}
              className="p-2 bg-white border border-white-light text-charcoal-medium rounded-lg hover:bg-white-light hover:text-charcoal transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

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

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:gap-6 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-4">

              {/* --- LEFT: CHART & CALLS --- */}
              <div className="min-w-0 space-y-4 md:space-y-6 lg:space-y-8 xl:col-span-2 2xl:col-span-3">

                {/* Real Chart */}
                <CallVolumeChart
                  data={chartData}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  trend={stats.totalTrend}
                />
              </div>

              {/* --- RIGHT: ACTION QUEUE, TRANSCRIPTS, APPOINTMENTS --- */}
              <div className="min-w-0 space-y-4 xl:col-span-1 2xl:col-span-1">
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
