import { AISummary } from './components/AISummary';
import { RecentReviews } from './components/RecentReviews';
import { ReviewOverview } from './components/ReviewOverview';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const reviewsData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    initials: 'SJ',
    color: 'bg-indigo-100 text-indigo-700',
    rating: 5,
    time: '2 hours ago',
    text: 'Absolutely loved the service! The staff was incredibly helpful and the atmosphere was perfect. Will definitely be coming back.',
    replied: true,
  },
  {
    id: 2,
    name: 'Michael Chen',
    initials: 'MC',
    color: 'bg-emerald-100 text-emerald-700',
    rating: 4,
    time: '5 hours ago',
    text: 'Great experience overall. The food was excellent, though the wait time was a bit longer than expected for a Tuesday night.',
    replied: true,
  },
  {
    id: 3,
    name: 'Emily Davis',
    initials: 'ED',
    color: 'bg-amber-100 text-amber-700',
    rating: 2,
    time: '1 day ago',
    text: 'Disappointed with the recent visit. The noise level was too high and our order was incorrect twice. Hope they can improve.',
    replied: false,
    critical: true,
  },
  {
    id: 4,
    name: 'Robert Wilson',
    initials: 'RW',
    color: 'bg-purple-100 text-purple-700',
    rating: 5,
    time: '2 days ago',
    text: 'One of the best places in town. The attention to detail is remarkable. Highly recommend the seasonal specials!',
    replied: true,
  }
];

const Reviews = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ReviewOverview />
        
        <AISummary />

        <RecentReviews reviews={reviewsData} />
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
