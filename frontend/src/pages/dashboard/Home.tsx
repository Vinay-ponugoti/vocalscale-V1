import { useState, useMemo } from 'react';
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
import ReviewStats from '../../components/dashboard/ReviewStats';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import CalendarPicker from '../../components/dashboard/CalendarPicker';
import { PAGE_PADDING } from '../../constants/layout';
import { cn } from '../../lib/utils';

const Home = () => {
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';

  // Use a helper to get "today" in the business timezone
  const getBusinessToday = () => toZonedTime(new Date(), timezone);

  const [selectedDate, setSelectedDate] = useState(getBusinessToday());
  const [timeRange, setTimeRange] = useState('7d');

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

  const { loading, isPlaceholderData, stats, recentCalls, appointments, chartData } = useDashboardData(selectedDate, daysCount, timezone);

  const handlePrev = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNext = () => {
    if (!isBusinessToday) setSelectedDate(prev => addDays(prev, 1));
  };

  const isInitialLoading = loading && !isPlaceholderData;

  return (
    <DashboardLayout fullWidth>
      <div className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full space-y-8", PAGE_PADDING)}>

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-charcoal tracking-tight">
                Overview
              </h1>
              {isPlaceholderData && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-electric/10 text-blue-electric rounded-full animate-pulse">
                  <Clock size={12} className="animate-spin-slow" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Updating...</span>
                </div>
              )}
            </div>
            <p className="text-charcoal-light mt-1 text-sm font-medium">
              Real-time performance metrics for your AI agent.
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

        {isInitialLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* --- Stats Grid --- */}
            <div className="w-full">
              <StatsGrid
                stats={stats}
                appointmentsCount={appointments.length}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-10">

              {/* --- LEFT: CHART & CALLS --- */}
              <div className="lg:col-span-2 2xl:col-span-3 space-y-6 2xl:space-y-10">

                {/* Real Chart */}
                <CallVolumeChart
                  data={chartData}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  trend={stats.totalTrend}
                />
              </div>

              {/* --- RIGHT: RECENT TRANSCRIPTS --- */}
              <div className="lg:col-span-1 2xl:col-span-1 h-full">
                <RecentTranscripts calls={recentCalls} />
              </div>

            </div>



            {/* Review Insights - Moved to full width */}
            <div className="w-full">
              <ReviewStats />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Home;