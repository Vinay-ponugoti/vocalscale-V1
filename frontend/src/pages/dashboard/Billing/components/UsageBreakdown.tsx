import React, { useEffect, useState } from 'react';
import { BarChart3, Timer, CheckCircle2, Download, Loader2, Calendar } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

const UsageBreakdown: React.FC = () => {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await billingApi.getUsage();
        setUsage(data);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-black text-charcoal tracking-tight uppercase flex items-center gap-2">
          <BarChart3 size={18} className="text-charcoal-light" /> Usage Analysis
        </h2>
        <Card className="h-48 border-none shadow-xl shadow-charcoal/5 flex items-center justify-center">
          <Loader2 className="animate-spin text-charcoal-light" size={24} />
        </Card>
      </div>
    );
  }

  const avgDurationFormatted = usage?.avg_duration_seconds
    ? `${Math.floor(usage.avg_duration_seconds / 60)}m ${Math.round(usage.avg_duration_seconds % 60)}s`
    : '0s';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <BarChart3 size={16} />
        </div>
        <h2 className="text-lg font-black text-charcoal tracking-tight">Usage Analysis</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {/* Left Stats Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-xl shadow-charcoal/5 hover:shadow-charcoal/10 transition-all duration-300">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-white-light flex items-center justify-center text-charcoal-light">
                  <Timer size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Avg Duration</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">{avgDurationFormatted}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-charcoal/5 hover:shadow-charcoal/10 transition-all duration-300">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">{usage?.success_rate || 100}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Minute Distribution Card */}
          <Card className="border-none shadow-xl shadow-charcoal/5">
            <CardContent className="p-6">
              <h3 className="font-black text-charcoal uppercase text-[10px] tracking-widest mb-5">Distribution</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="font-bold text-charcoal-medium">AI Minutes</span>
                    <span className="text-charcoal font-black">
                      {Math.round((usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%
                      <span className="text-[9px] text-charcoal-light font-bold ml-1">({usage?.used_minutes}m)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white-light flex justify-between items-center text-[10px]">
                  <span className="font-bold text-charcoal-light">Total Calls</span>
                  <span className="font-black text-charcoal">{usage?.total_calls || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Usage Days Table */}
        <Card className="lg:col-span-2 2xl:col-span-3 border-none shadow-xl shadow-charcoal/5">
          <CardHeader className="pb-0 border-none">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm font-black text-charcoal uppercase tracking-widest">Recent Activity</CardTitle>
              <button className="flex items-center gap-1.5 rounded-lg bg-white-light border border-transparent px-3 py-1.5 text-[10px] font-black text-charcoal-medium hover:bg-white-medium transition-colors uppercase tracking-widest">
                <Download size={12} /> Export
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[9px] font-black text-charcoal-light uppercase tracking-widest border-b border-white-light">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Day</th>
                    <th className="pb-3">Calls</th>
                    <th className="pb-3 pr-2 text-right">Consumption</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white-light">
                  {!usage?.daily_usage || usage.daily_usage.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-charcoal-light">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar size={24} className="text-charcoal-light/50" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No activity recorded</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usage.daily_usage.map((row: any, i: number) => {
                      const dateObj = parseISO(row.date);
                      return (
                        <tr key={i} className="group hover:bg-white-light/30 transition-colors">
                          <td className="py-4 pl-2 font-bold text-charcoal">{format(dateObj, 'MMM d, yyyy')}</td>
                          <td className="py-4 text-charcoal-light font-bold uppercase text-[9px] tracking-wider">{format(dateObj, 'EEEE')}</td>
                          <td className="py-4 font-medium text-charcoal-medium">{row.calls} Calls</td>
                          <td className="py-4 pr-2 text-right">
                            <span className="inline-flex items-center rounded bg-white-medium px-2 py-1 text-[10px] font-black text-charcoal">
                              {row.minutes.toFixed(1)}m
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsageBreakdown;
