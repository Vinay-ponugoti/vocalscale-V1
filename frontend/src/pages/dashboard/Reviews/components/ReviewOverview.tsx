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
        <div className="mb-4 h-10 w-48 rounded-lg bg-slate-100"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-lg border border-slate-200 bg-white"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-lg border border-slate-200 bg-white lg:col-span-2"></div>
          <div className="h-80 rounded-lg border border-slate-200 bg-white"></div>
        </div>
      </div>
    );
  }

  const reviewVolumeData = stats?.reviewVolume || [];
  const sentimentData = stats?.sentiment || [];
  const trends = stats?.trends || { rating: 0, reviews: 0, responseRate: 0, responseTime: 0 };
  const hasSentimentData = sentimentData.some(s => s.value > 0);

  return (
    <div className="space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">Review Analytics</h2>
            <p className="text-sm font-medium text-slate-500">Monitor performance and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPaid && onSync && (
            <Button
              size="sm"
              onClick={onSync}
              disabled={isSyncing}
              className="flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Google Reviews'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-slate-950">{stats?.overallRating?.toFixed(1) || '0.0'}</span>
              <div>
                <StarRating rating={stats?.overallRating || 0} />
                <Badge variant="secondary" className="mt-1 rounded-md bg-slate-100 text-slate-500">
                  {stats?.totalReviews ? 'Verified' : 'No Rating'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-black text-slate-950">{stats?.totalReviews || 0}</span>
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

        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-black text-slate-950">{stats?.responseRate || 0}%</span>
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

        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating Distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {(stats?.ratingDistribution || []).map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 w-6">{item.stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-700"
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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Review Volume Chart */}
        <Card className="rounded-lg border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-slate-950">Review Volume</CardTitle>
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
        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-slate-950">Sentiment</CardTitle>
              <CardDescription>Overall sentiment breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!isPaid ? (
              <div className="flex h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
                  <Lock className="h-6 w-6 text-slate-400" />
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
