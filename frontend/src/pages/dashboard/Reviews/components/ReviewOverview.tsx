import { Lock, Star, MessageSquare, Reply } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import { StatCard } from '../../../../components/ui/StatCard';
import { GRID_GAP } from '../../../../constants/layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { ReviewStats } from '../../../../types/review';

interface ReviewOverviewProps {
  stats?: ReviewStats;
  loading?: boolean;
}

export const ReviewOverview = ({ stats, loading }: ReviewOverviewProps) => {
  const isPaid = stats?.isPaid ?? false;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="h-80 rounded-xl border border-slate-200 bg-white lg:col-span-2"></div>
          <div className="h-80 rounded-xl border border-slate-200 bg-white"></div>
        </div>
      </div>
    );
  }

  const reviewVolumeData = stats?.reviewVolume || [];
  const sentimentData = stats?.sentiment || [];
  const trends = stats?.trends || { rating: 0, reviews: 0, responseRate: 0, responseTime: 0 };
  const hasSentimentData = sentimentData.some(s => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 ${GRID_GAP}`}>
        <StatCard
          icon={Star}
          tint="amber"
          label="Overall rating"
          value={stats?.overallRating?.toFixed(1) || '0.0'}
          footer={<StarRating rating={stats?.overallRating || 0} size={12} />}
          description={stats?.totalReviews ? 'Verified' : 'No rating yet'}
        />
        <StatCard
          icon={MessageSquare}
          label="Total reviews"
          value={stats?.totalReviews || 0}
          trend={trends.reviews !== 0 ? { value: trends.reviews, isPositive: trends.reviews >= 0 } : undefined}
          description="vs previous period"
        />
        <StatCard
          icon={Reply}
          tint="emerald"
          label="Response rate"
          value={`${stats?.responseRate || 0}%`}
          trend={trends.responseRate !== 0 ? { value: Math.round(trends.responseRate), isPositive: trends.responseRate >= 0 } : undefined}
          description="Reviews with a reply"
        />

        <div className="flex h-full min-h-[112px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase leading-5 tracking-wider text-slate-500">Rating breakdown</span>
          <div className="mt-2 space-y-1">
            {(stats?.ratingDistribution || []).map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="w-6 text-xs font-medium text-slate-500">{item.stars}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] font-medium text-slate-500">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 ${GRID_GAP}`}>
        {/* Review Volume Chart */}
        <Card className="rounded-xl border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">Review volume</CardTitle>
              <CardDescription className="mt-0.5 text-xs text-slate-500">Reviews over the selected period</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              {reviewVolumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewVolumeData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--twc-slate-200))" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgb(var(--twc-slate-500))', fontSize: 11 }}
                      interval={reviewVolumeData.length > 14 ? Math.floor(reviewVolumeData.length / 7) : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgb(var(--twc-slate-500))', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid rgb(var(--twc-slate-200))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="positive" fill="rgb(var(--twc-emerald-500))" radius={[4, 4, 0, 0]} name="Positive" stackId="a" />
                    <Bar dataKey="negative" fill="rgb(var(--twc-red-500))" radius={[4, 4, 0, 0]} name="Negative" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-slate-400 text-sm">No review data for this period</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600">Negative</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Pie Chart — gated for free users */}
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">Sentiment</CardTitle>
              <CardDescription className="mt-0.5 text-xs text-slate-500">How reviewers felt overall</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!isPaid ? (
              <div className="flex h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
                  <Lock className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Sentiment analysis</h4>
                <p className="text-sm text-slate-500 max-w-[200px]">
                  Upgrade to a paid plan to unlock AI-powered sentiment analysis
                </p>
              </div>
            ) : hasSentimentData ? (
              <>
                <div className="h-[180px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-slate-400 text-sm">Not enough reviews for sentiment analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewOverview;
