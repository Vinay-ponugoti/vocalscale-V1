import { AISummary } from './components/AISummary';
import { RecentReviews } from './components/RecentReviews';
import { ReviewOverview } from './components/ReviewOverview';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useReviews } from '../../../hooks/useReviews';

const Reviews = () => {
  const { stats, reviews, summary } = useReviews();

  return (
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 2xl:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full">
        <ReviewOverview
          stats={stats.data}
          loading={stats.loading}
        />

        <AISummary
          summary={summary.data}
          loading={summary.loading}
        />

        <RecentReviews
          reviews={reviews.data}
          loading={reviews.loading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
