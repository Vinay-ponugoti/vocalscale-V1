import React, { useEffect, useState } from 'react';
import { BarChart3, Timer, TrendingUp, CheckCircle2, Filter, Download, Loader2, Calendar } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { format, parseISO } from 'date-fns';

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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-electric/10 flex items-center justify-center text-blue-electric ring-1 ring-blue-electric/20">
            <BarChart3 size={20} />
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Usage Breakdown</h2>
        </div>
        <div className="h-64 rounded-3xl border border-dashed border-slate-200 bg-white flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-electric" size={32} />
        </div>
      </div>
    );
  }

  const avgDurationFormatted = usage?.avg_duration_seconds
    ? `${Math.floor(usage.avg_duration_seconds / 60)}m ${Math.round(usage.avg_duration_seconds % 60)}s`
    : '0s';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <BarChart3 size={20} />
        </div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Usage Analysis</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {/* Left Stats Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 group hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Timer size={18} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Duration</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{avgDurationFormatted}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32 group hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-xl font-black text-slate-900 tracking-tight">{usage?.success_rate || 100}%</p>
              </div>
            </div>
          </div>

          {/* Minute Distribution Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-widest mb-6">Distribution</h3>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="font-bold text-slate-600">AI Minutes</span>
                  <span className="text-slate-900 font-black">
                    {Math.round((usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%
                    <span className="text-[10px] text-slate-400 font-bold ml-1">({usage?.used_minutes}m)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-50 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">Total Calls Processed</span>
                <span className="font-black text-slate-900">{usage?.total_calls || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Usage Days Table */}
        <div className="lg:col-span-2 2xl:col-span-3 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-widest">Recent Activity</h3>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2 text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-widest">
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-4 pl-4">Date</th>
                  <th className="pb-4">Day</th>
                  <th className="pb-4">Calls</th>
                  <th className="pb-4 pr-4 text-right">Consumption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!usage?.daily_usage || usage.daily_usage.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                          <Calendar size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">No activity recorded</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usage.daily_usage.map((row: any, i: number) => {
                    const dateObj = parseISO(row.date);
                    return (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-4 font-bold text-slate-900">{format(dateObj, 'MMM d, yyyy')}</td>
                        <td className="py-5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">{format(dateObj, 'EEEE')}</td>
                        <td className="py-5 font-medium text-slate-600">{row.calls} Calls</td>
                        <td className="py-5 pr-4 text-right">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-700">
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
        </div>
      </div>
    </div>
  );
};

export default UsageBreakdown;
