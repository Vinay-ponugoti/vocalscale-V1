import { AISummary } from './components/AISummary';
import { RecentReviews } from './components/RecentReviews';
import { ReviewOverview } from './components/ReviewOverview';
import { ConnectGoogleBusiness } from './components/ConnectGoogleBusiness';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useReviews } from '../../../hooks/useReviews';

const Reviews = () => {
  const { stats, reviews, summary, sync } = useReviews();

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[#f7f8fb] text-slate-950">
        <div className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-5 md:px-6 md:py-8 xl:px-8">
          <ConnectGoogleBusiness onVerified={sync.trigger} />

          <ReviewOverview
            stats={stats.data}
            loading={stats.loading}
            onSync={sync.trigger}
            isSyncing={sync.isSyncing}
          />

          <AISummary
            summary={summary.data}
            loading={summary.loading}
          />

          <RecentReviews
            reviews={reviews.data}
            loading={reviews.loading}
            isPaid={reviews.isPaid || stats.data?.isPaid}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
