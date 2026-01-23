import React from 'react';
import { BarChart3, Timer, CheckCircle2, Download, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

interface UsageBreakdownProps {
  usage: any;
  hasSubscription: boolean;
}

const UsageBreakdown: React.FC<UsageBreakdownProps> = ({ usage, hasSubscription }) => {
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
            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-50/50">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-charcoal-light shadow-sm ring-1 ring-slate-100">
                  <Timer size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Avg Duration</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">{avgDurationFormatted}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-50/50">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">{usage?.success_rate || 100}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-50/50">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm ring-1 ring-amber-100">
                  <Timer size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Overage</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">
                    {usage?.overage_minutes > 0 ? `${parseFloat(usage.overage_minutes).toFixed(1)}m` : '0m'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-50/50">
              <CardContent className="p-5 flex flex-col justify-between h-28">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm ring-1 ring-rose-100">
                  <Timer size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-charcoal-light uppercase tracking-widest mb-1">Est. Cost</p>
                  <p className="text-lg font-black text-charcoal tracking-tight">
                    ${usage?.estimated_cost ? parseFloat(usage.estimated_cost).toFixed(2) : '0.00'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Minute Distribution Card */}
          <Card className="border border-slate-100 shadow-sm bg-white">
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
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="font-bold text-charcoal-light">Total Calls</span>
                  <span className="font-black text-charcoal">{usage?.total_calls || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Usage Days Table */}
        <Card className="lg:col-span-2 2xl:col-span-3 border border-slate-100 shadow-sm bg-white">
          <CardHeader className="pb-0 border-none">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm font-black text-charcoal uppercase tracking-widest">Recent Activity</CardTitle>
              <button className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-black text-charcoal-medium hover:bg-slate-100 transition-colors uppercase tracking-widest">
                <Download size={12} /> Export
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[9px] font-black text-charcoal-light uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Day</th>
                    <th className="pb-3">Calls</th>
                    <th className="pb-3 pr-2 text-right">Consumption</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!usage?.daily_usage || usage.daily_usage.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-charcoal-light">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar size={24} className="text-slate-200" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No activity recorded</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usage.daily_usage.map((row: any, i: number) => {
                      const dateObj = parseISO(row.date);
                      return (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-2 font-bold text-charcoal">{format(dateObj, 'MMM d, yyyy')}</td>
                          <td className="py-4 text-charcoal-light font-bold uppercase text-[9px] tracking-wider">{format(dateObj, 'EEEE')}</td>
                          <td className="py-4 font-medium text-charcoal-medium">{row.calls} Calls</td>
                          <td className="py-4 pr-2 text-right">
                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-charcoal">
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
