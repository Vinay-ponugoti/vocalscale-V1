import { useMemo, useState } from 'react';
import { Search, CheckCircle, Sparkles, Reply, Layers, MoreHorizontal, Filter, Lock } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import type { Review } from '../../../../types/review';

interface RecentReviewsProps {
  reviews: Review[];
  loading?: boolean;
  isPaid?: boolean;
}

const SentimentBadge = ({ sentiment }: { sentiment?: string }) => {
  if (!sentiment) return null;
  const styles: Record<string, string> = {
    Positive: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Neutral: 'bg-amber-50 text-amber-600 border-amber-100',
    Negative: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <Badge variant="outline" className={`${styles[sentiment] || ''} font-bold text-[10px] uppercase tracking-wider rounded-lg px-2 py-0.5`}>
      {sentiment}
    </Badge>
  );
};

export const RecentReviews = ({ reviews, loading, isPaid }: RecentReviewsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return reviews;
    return reviews.filter((review) => [
      review.name,
      review.text,
      review.sentiment,
      String(review.rating)
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [reviews, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-slate-100"></div>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse rounded-lg border border-slate-200 bg-white"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">Recent Feedback</h2>
            <p className="text-sm font-medium text-slate-500">Real-time customer responses</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-700" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm font-semibold text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 sm:w-64"
              placeholder="Filter reviews..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md border-slate-200 px-4 font-bold text-slate-600 sm:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-4 2xl:space-y-6">
          {filteredReviews.length === 0 ? (
            <Card className="rounded-lg border-dashed border-slate-200 bg-white shadow-sm">
              <CardContent className="py-12 sm:py-20 flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 sm:h-16 sm:w-16">
                  <Layers className="h-6 w-6 text-slate-300 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                  {reviews.length === 0 ? 'No feedback yet' : 'No matching reviews'}
                </h3>
                <p className="text-slate-500 max-w-[240px] sm:max-w-xs mt-1 text-xs sm:text-sm">
                  {reviews.length > 0
                    ? 'Try a different filter term.'
                    : isPaid
                    ? 'Click "Sync Google Reviews" above to pull in your latest reviews.'
                    : 'Once your customers start leaving reviews, they\'ll appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : filteredReviews.map(review => (
            <Card key={review.id} className="group rounded-lg border-slate-200 shadow-sm transition-colors hover:border-cyan-100 hover:bg-cyan-50/20">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${review.color} text-lg font-bold shadow-sm`}>
                    {review.initials}
                  </div>
                  <div>
                    <CardTitle className="text-base font-black tracking-tight text-slate-950">{review.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        {review.time}
                        {review.original_timestamp && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 mx-1"></span>
                            <span className="font-medium text-slate-400/80">
                              {new Date(review.original_timestamp).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.sentiment && <SentimentBadge sentiment={review.sentiment} />}
                  {review.critical && (
                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 animate-pulse font-black text-[10px] uppercase tracking-wider rounded-lg px-2.5 py-1">
                      Priority
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-[15px] font-medium leading-relaxed text-slate-600">
                  {review.text}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  {review.replied ? (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 font-bold uppercase tracking-wider text-[10px] rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                        Responded
                      </Badge>
                    </div>
                  ) : isPaid ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex h-9 items-center gap-2 rounded-md bg-cyan-700 px-4 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-cyan-800">
                        <Sparkles className="w-4 h-4" />
                        {review.critical ? 'Draft Apology' : 'AI Smart Reply'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex h-9 items-center gap-2 rounded-md border-slate-200 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <Reply className="w-4 h-4" />
                        Manual
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Upgrade to reply to reviews</span>
                    </div>
                  )}

                  {!review.replied && review.critical && isPaid && (
                    <button className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider">
                      Escalate
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
