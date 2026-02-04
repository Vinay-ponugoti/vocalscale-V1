import { Settings, TrendingUp, TrendingDown, MoreHorizontal, RefreshCw } from 'lucide-react';
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
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../hooks/useToast';
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
  const { isConfigured } = useAuth();
  const { showToast } = useToast();

  const handleSyncGoogle = async () => {
    if (!isConfigured) {
      showToast('Service unavailable.', 'error');
      return;
    }

    try {
      // Redirect URL for the callback
      const redirectUrl = `${window.location.origin}/auth/callback`;

      // Get the Google Auth URL from backend with necessary business permissions
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-url?redirect_to=${encodeURIComponent(redirectUrl)}`);

      if (!response.ok) throw new Error('Failed to get auth URL');

      const { url } = await response.json();

      // Redirect the user to Google
      window.location.href = url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during Google sync.';
      showToast(message, 'error');
    }
  };

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
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-xl border-slate-200 font-bold text-slate-600 h-10 px-4">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            size="sm"
            onClick={handleSyncGoogle}
            className="flex-1 sm:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Google
          </Button>
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
              <div className={`flex items-center ${trends.reviews >= 0 ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`}>
                {trends.reviews >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(trends.reviews)}%
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Response Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-900">{stats?.responseRate || 0}%</span>
              <div className={`flex items-center ${trends.responseRate >= 0 ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`}>
                {trends.responseRate >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(trends.responseRate)}%
              </div>
            </div>
            <Progress value={stats?.responseRate || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-900">{stats?.avgResponseTime || 0}h</span>
              <div className={`flex items-center ${trends.responseTime <= 0 ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`}>
                {trends.responseTime <= 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                {Math.abs(trends.responseTime)}h
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Target: under 2h</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Volume Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Review Volume</CardTitle>
                <CardDescription>Daily reviews over the past week</CardDescription>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                  Daily
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-3">
                  Weekly
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-3">
                  Monthly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reviewVolumeData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="positive" fill="#10B981" radius={[4, 4, 0, 0]} name="Positive" />
                  <Bar dataKey="negative" fill="#EF4444" radius={[4, 4, 0, 0]} name="Negative" />
                </BarChart>
              </ResponsiveContainer>
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

        {/* Sentiment Pie Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sentiment</CardTitle>
                <CardDescription>Overall sentiment breakdown</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default ReviewOverview;
