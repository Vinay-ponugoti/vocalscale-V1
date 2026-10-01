import { AISummary } from './components/AISummary';
import { RecentReviews } from './components/RecentReviews';
import { ReviewOverview } from './components/ReviewOverview';
import { ConnectGoogleBusiness } from './components/ConnectGoogleBusiness';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useReviews } from '../../../hooks/useReviews';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { PAGE_CONTAINER } from '../../../constants/layout';
import { RefreshCw } from 'lucide-react';

const Reviews = () => {
  const { stats, reviews, summary, sync, respond } = useReviews();

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
          <PageHeader
            title="Reviews"
            description="Your Google reviews, ratings, and replies in one place."
            actions={stats.data?.isPaid && (
              <Button variant="outline" onClick={sync.trigger} disabled={sync.isSyncing}>
                <RefreshCw size={15} className={sync.isSyncing ? 'animate-spin' : ''} />
                {sync.isSyncing ? 'Syncing…' : 'Sync reviews'}
              </Button>
            )}
          />

          <ConnectGoogleBusiness onVerified={sync.trigger} />

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
            isPaid={reviews.isPaid || stats.data?.isPaid}
            onRespond={respond.submit}
            isResponding={respond.isSubmitting}
          />
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
