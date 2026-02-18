import { TrendingUp, TrendingDown, RefreshCw, Lock } from 'lucide-react';
import { StarRating } from '../../../../components/ui/StarRating';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Progress } from '../../../../components/ui/Progress';
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
  onSync?: () => void;
  isSyncing?: boolean;
}

export const ReviewOverview = ({ stats, loading, onSync, isSyncing }: ReviewOverviewProps) => {
  const isPaid = stats?.isPaid ?? false;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-xl w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-100"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-50 rounded-2xl border border-slate-100"></div>
          <div className="h-80 bg-slate-50 rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  const reviewVolumeData = stats?.reviewVolume || [];
  const sentimentData = stats?.sentiment || [];
  const trends = stats?.trends || { rating: 0, reviews: 0, responseRate: 0, responseTime: 0 };
  const hasSentimentData = sentimentData.some(s => s.value > 0);

  return (
    <div className="space-y-6 2xl:space-y-10 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Review Analytics</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Monitor performance and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPaid && onSync && (
            <Button
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Google Reviews'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-slate-900">{stats?.overallRating?.toFixed(1) || '0.0'}</span>
              <div>
                <StarRating rating={stats?.overallRating || 0} />
                <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-500">
                  {stats?.totalReviews ? 'Verified' : 'No Rating'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-900">{stats?.totalReviews || 0}</span>
              {trends.reviews !== 0 && (
                <div className={`flex items-center ${trends.reviews >= 0 ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`}>
                  {trends.reviews >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {Math.abs(trends.reviews)}%
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-900">{stats?.responseRate || 0}%</span>
              {trends.responseRate !== 0 && (
                <div className={`flex items-center ${trends.responseRate >= 0 ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`}>
                  {trends.responseRate >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {Math.abs(Math.round(trends.responseRate))}%
                </div>
              )}
            </div>
            <Progress value={stats?.responseRate || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rating Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {(stats?.ratingDistribution || []).map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 w-6">{item.stars}★</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-lg font-bold">Review Volume</CardTitle>
              <CardDescription>Reviews over the selected period</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              {reviewVolumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewVolumeData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      interval={reviewVolumeData.length > 14 ? Math.floor(reviewVolumeData.length / 7) : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="positive" fill="#10B981" radius={[4, 4, 0, 0]} name="Positive" stackId="a" />
                    <Bar dataKey="negative" fill="#EF4444" radius={[4, 4, 0, 0]} name="Negative" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400 text-sm">No review data for this period</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
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
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sentiment</CardTitle>
              <CardDescription>Overall sentiment breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!isPaid ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Sentiment Analysis</h4>
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
