import { Search, CheckCircle, Sparkles, Reply, Layers, MoreHorizontal, Filter } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Progress } from '../../../../components/ui/Progress';
import type { Review } from '../../../../types/review';

interface RecentReviewsProps {
  reviews: Review[];
  loading?: boolean;
}

export const RecentReviews = ({ reviews, loading }: RecentReviewsProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-100 rounded-xl w-64 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse"></div>)}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse"></div>
            <div className="h-48 bg-indigo-50 rounded-2xl border border-indigo-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 2xl:space-y-10 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Recent Feedback</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Real-time customer responses</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all w-full sm:w-64 shadow-sm"
              placeholder="Filter reviews..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-xl border-slate-200 font-bold text-slate-600 h-10 px-4">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="default" size="sm" className="flex-1 sm:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4">
              View All
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-10">
        <div className="lg:col-span-8 2xl:col-span-9 space-y-4 2xl:space-y-6">
          {reviews.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50/50">
              <CardContent className="py-12 sm:py-20 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">No feedback yet</h3>
                <p className="text-slate-500 max-w-[240px] sm:max-w-xs mt-1 text-xs sm:text-sm">
                  Once your customers start leaving reviews, they'll appear here for you to manage.
                </p>
              </CardContent>
            </Card>
          ) : reviews.map(review => (
            <Card key={review.id} className="group border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${review.color} flex items-center justify-center font-bold text-lg shadow-sm transform group-hover:scale-105 transition-transform duration-500`}>
                    {review.initials}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 tracking-tight">{review.name}</CardTitle>
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
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.critical && (
                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 animate-pulse font-black text-[10px] uppercase tracking-wider rounded-lg px-2.5 py-1">
                      Priority
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 font-medium text-[15px] leading-relaxed mb-6">
                  {review.text}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  {review.replied ? (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100/50 font-bold uppercase tracking-wider text-[10px] rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                        AI Responded
                      </Badge>
                      <button className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">Edit Response</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider px-4 h-9 shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {review.critical ? 'Draft Apology' : 'AI Smart Reply'}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider px-4 h-9 flex items-center gap-2">
                        <Reply className="w-4 h-4" />
                        Manual
                      </Button>
                    </div>
                  )}

                  {!review.replied && review.critical && (
                    <button className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider">
                      Escalate
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-50">
                <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Live Sources</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {[
                  { name: 'Google Business', icon: 'G', color: 'bg-blue-50 text-blue-600', status: 'Healthy' },
                  { name: 'Yelp Reviews', icon: 'Y', color: 'bg-red-50 text-red-600', status: 'Active' },
                  { name: 'TripAdvisor', icon: 'T', color: 'bg-emerald-50 text-emerald-600', status: 'Healthy' },
                  { name: 'OpenTable', icon: 'O', color: 'bg-rose-50 text-rose-600', status: 'Active' }
                ].map((source, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${source.color} flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                        {source.icon}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700 block group-hover:text-indigo-600 transition-colors">{source.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{source.status}</span>
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4 border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-widest h-11 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  Connect New Source +
                </Button>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
};
