import { Settings, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
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

// Sample data for charts
const reviewVolumeData = [
  { day: 'Mon', reviews: 12, positive: 10, negative: 2 },
  { day: 'Tue', reviews: 19, positive: 16, negative: 3 },
  { day: 'Wed', reviews: 15, positive: 12, negative: 3 },
  { day: 'Thu', reviews: 25, positive: 22, negative: 3 },
  { day: 'Fri', reviews: 22, positive: 18, negative: 4 },
  { day: 'Sat', reviews: 30, positive: 26, negative: 4 },
  { day: 'Sun', reviews: 28, positive: 24, negative: 4 },
];

const sentimentData = [
  { name: 'Positive', value: 78, color: '#10B981' },
  { name: 'Neutral', value: 15, color: '#6366F1' },
  { name: 'Negative', value: 7, color: '#EF4444' },
];

export const ReviewOverview = () => {
  return (
    <div className="space-y-6 2xl:space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Review Analytics</h2>
            <p className="text-sm text-slate-500 font-medium">Monitor your review performance and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-slate-600 h-10 px-4">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4">Export Report</Button>
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
              <span className="text-4xl font-bold text-slate-900">4.6</span>
              <div>
                <StarRating rating={4.6} />
                <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-700">
                  Excellent
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
              <span className="text-4xl font-bold text-slate-900">328</span>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
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
              <span className="text-4xl font-bold text-slate-900">94%</span>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5%
              </div>
            </div>
            <Progress value={94} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-900">2.4h</span>
              <div className="flex items-center text-red-500 text-sm font-medium">
                <TrendingDown className="w-4 h-4 mr-1" />
                +0.3h
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Review Volume</CardTitle>
                <CardDescription>Daily reviews over the past week</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-8">
                  Daily
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Weekly
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Monthly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
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
            <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
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
