import { useMemo, useState } from 'react';
import { Search, CheckCircle, FileText, Reply, Layers, MoreHorizontal, Filter, Lock, Send, X, MapPin } from 'lucide-react';
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
  onRespond?: (reviewId: string, text: string) => Promise<unknown>;
  isResponding?: boolean;
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

export const RecentReviews = ({ reviews, loading, isPaid, onRespond, isResponding }: RecentReviewsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'needs-reply' | 'critical' | 'responded'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'lowest' | 'highest'>('newest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const filteredReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = reviews.filter((review) => {
      const matchesSearch = !query || [
        review.name,
        review.text,
        review.sentiment,
        String(review.rating)
      ].some((value) => value?.toLowerCase().includes(query));
      const matchesInbox = inboxFilter === 'all'
        || (inboxFilter === 'needs-reply' && !review.replied)
        || (inboxFilter === 'critical' && !!review.critical)
        || (inboxFilter === 'responded' && review.replied);
      const matchesRating = ratingFilter === 'all'
        || (ratingFilter === 'low' ? review.rating <= 2 : review.rating === Number(ratingFilter));
      return matchesSearch && matchesInbox && matchesRating;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'highest') return b.rating - a.rating;
      return new Date(b.original_timestamp || 0).getTime() - new Date(a.original_timestamp || 0).getTime();
    });
  }, [reviews, searchQuery, inboxFilter, ratingFilter, sortBy]);

  const inboxCounts = useMemo(() => ({
    all: reviews.length,
    needsReply: reviews.filter(review => !review.replied).length,
    critical: reviews.filter(review => review.critical).length,
    responded: reviews.filter(review => review.replied).length,
  }), [reviews]);

  const openReply = (review: Review, smart: boolean) => {
    setReplyingTo(review.id);
    setReplyError(null);
    setReplyText(smart
      ? review.rating <= 2
        ? `Thank you for sharing this. We’re sorry the experience did not meet expectations. We’re reviewing what happened and would appreciate the opportunity to make it right.`
        : `Thank you, ${review.name.split(' ')[0]}! We appreciate your feedback and are glad you had a positive experience with our team.`
      : '');
  };

  const submitReply = async (reviewId: string) => {
    const text = replyText.trim();
    if (!text || !onRespond) return;
    setReplyError(null);
    try {
      await onRespond(reviewId, text);
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'Could not save the response.');
    }
  };

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
            <h2 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">Review Inbox</h2>
            <p className="text-sm font-medium text-slate-500">Prioritize feedback and respond from one place</p>
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
            <div className="relative flex-1 sm:flex-none">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value as typeof ratingFilter)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-xs font-bold text-slate-600 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:w-[128px]"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="low">1–2 stars</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:flex-none"
            >
              <option value="newest">Newest first</option>
              <option value="lowest">Lowest rating</option>
              <option value="highest">Highest rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        {([
          { value: 'all', label: 'All reviews', count: inboxCounts.all },
          { value: 'needs-reply', label: 'Needs reply', count: inboxCounts.needsReply },
          { value: 'critical', label: 'Critical', count: inboxCounts.critical },
          { value: 'responded', label: 'Responded', count: inboxCounts.responded },
        ] as const).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setInboxFilter(item.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-bold transition ${
              inboxFilter === item.value
                ? item.value === 'critical' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' : 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.label}
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${
              inboxFilter === item.value
                ? item.value === 'critical' ? 'bg-white text-rose-600' : 'bg-white/15 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}>{item.count}</span>
          </button>
        ))}
        <span className="ml-auto hidden px-2 text-[11px] font-semibold text-slate-400 sm:inline">
          Showing {filteredReviews.length} of {reviews.length}
        </span>
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
                      {review.source?.startsWith('google') && (
                        <span className="hidden items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600 sm:flex">
                          <MapPin className="h-2.5 w-2.5" /> Google
                        </span>
                      )}
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

                {review.replied && review.response && (
                  <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3.5">
                    <div className="mb-1.5 flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Response from owner</p>
                    </div>
                    <p className="text-sm font-medium leading-6 text-slate-650">{review.response}</p>
                  </div>
                )}

                {replyingTo === review.id && (
                  <div className="mb-5 rounded-lg border border-cyan-100 bg-cyan-50/40 p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900">Reply publicly on Google</p>
                      <button onClick={() => setReplyingTo(null)} className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Cancel reply"><X className="h-4 w-4" /></button>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="Write a professional response…"
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium leading-5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                    {replyError && <p className="mt-1.5 text-xs font-semibold text-rose-600">{replyError}</p>}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-medium text-slate-400">{replyText.length}/1000</span>
                      <Button
                        size="sm"
                        disabled={!replyText.trim() || isResponding}
                        onClick={() => void submitReply(review.id)}
                        className="h-8 gap-2 rounded-md bg-cyan-700 px-3 text-xs font-bold text-white hover:bg-cyan-800"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isResponding ? 'Saving…' : 'Publish reply'}
                      </Button>
                    </div>
                  </div>
                )}

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
                      <Button onClick={() => openReply(review, true)} size="sm" className="flex h-9 items-center gap-2 rounded-md bg-cyan-700 px-4 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-cyan-800">
                        <FileText className="w-4 h-4" />
                        {review.critical ? 'Draft Apology' : 'Smart Reply'}
                      </Button>
                      <Button onClick={() => openReply(review, false)} variant="outline" size="sm" className="flex h-9 items-center gap-2 rounded-md border-slate-200 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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
