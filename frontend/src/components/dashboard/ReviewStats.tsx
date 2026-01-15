import { Star } from 'lucide-react';
import { StarRating } from '../ui/StarRating';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data for charts
const sentimentData = [
  { name: 'Positive', value: 0, color: '#10B981' },
  { name: 'Neutral', value: 0, color: '#3B82F6' },
  { name: 'Negative', value: 0, color: '#EF4444' },
];

const ratingDistribution = [
  { stars: 5, count: 0, percent: 0 },
  { stars: 4, count: 0, percent: 0 },
  { stars: 3, count: 0, percent: 0 },
  { stars: 2, count: 0, percent: 0 },
  { stars: 1, count: 0, percent: 0 },
];

const ReviewStats = () => {
  return (
    <div className="space-y-6 2xl:space-y-10">
      {/* Top Stats: Overall Rating and Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-10">
        <Card className="overflow-hidden border-none shadow-xl shadow-charcoal/5 bg-white">
          <CardHeader className="pb-4 border-b border-white-light">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-charcoal tracking-tight">Overall Sentiment</CardTitle>
                <CardDescription className="font-medium text-charcoal-light">Based on 0 recent reviews</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-1">
                0% Positive
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex flex-col items-center bg-white-light/50 rounded-3xl p-8 border border-white-light/50 w-full md:w-auto">
                <span className="text-7xl font-black text-charcoal leading-none tracking-tighter">0.0</span>
                <div className="mt-6">
                  <StarRating rating={0} size={28} />
                </div>
                <p className="mt-4 text-xs font-black text-charcoal-light uppercase tracking-[0.2em]">Verified Rating</p>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-4 group">
                    <div className="flex items-center gap-1.5 w-12">
                      <span className="text-sm font-bold text-charcoal-medium">{item.stars}</span>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-white-light h-2.5 rounded-full overflow-hidden border border-white-light/50">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 group-hover:brightness-110" 
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-charcoal-light w-10 text-right tabular-nums">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl shadow-charcoal/5 bg-white">
          <CardHeader className="pb-4 border-b border-white-light">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-charcoal tracking-tight">Sentiment Analysis</CardTitle>
                <CardDescription className="font-medium text-charcoal-light">Review tone breakdown</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {sentimentData.map((item) => (
                  <Badge key={item.name} variant="outline" className="font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ color: item.color, borderColor: `${item.color}20`, backgroundColor: `${item.color}08` }}>
                    {item.name}: {item.value}%
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative w-[180px] h-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-charcoal leading-none">0%</span>
                  <span className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mt-1">Positive</span>
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-6">
                {sentimentData.map((item) => (
                  <div key={item.name} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-black text-charcoal-medium uppercase tracking-wide">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-charcoal tabular-nums">{item.value}%</span>
                    </div>
                    <div className="flex-1 bg-white-light h-3 rounded-full overflow-hidden border border-white-light/50">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-sm" 
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewStats;
