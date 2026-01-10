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
        <div className="w-10 h-10 rounded-xl bg-blue-electric/10 flex items-center justify-center text-blue-electric ring-1 ring-blue-electric/20">
          <BarChart3 size={20} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-black text-charcoal tracking-tight uppercase">Usage Breakdown</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {/* Left Stats Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-32 hover:border-blue-electric/30 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-electric/10 text-blue-electric flex items-center justify-center group-hover:bg-blue-electric group-hover:text-white transition-all ring-1 ring-blue-electric/20">
                  <Timer size={20} />
                </div>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Duration</p>
                <p className="text-xl font-black text-charcoal tracking-tight">{avgDurationFormatted}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between h-32 hover:border-emerald-200 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all ring-1 ring-emerald-500/10">
                  <CheckCircle2 size={20} />
                </div>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-xl font-black text-charcoal tracking-tight">{usage?.success_rate || 100}%</p>
              </div>
            </div>
          </div>

          {/* Minute Distribution Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-charcoal uppercase text-[11px] tracking-widest">Minute Distribution</h3>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-electric shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                    <span className="font-bold text-slate-600">AI Minutes Used</span>
                  </div>
                  <span className="text-charcoal font-black">
                    {Math.round((usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}% 
                    <span className="text-[10px] text-slate-400 font-bold ml-1.5">({usage?.used_minutes}m)</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <div 
                    className="h-full bg-blue-600 rounded-full shadow-sm transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Conversations</span>
                  <span className="text-sm font-black text-charcoal">{usage?.total_calls || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Usage Days Table */}
        <div className="lg:col-span-2 2xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-charcoal uppercase text-[11px] tracking-widest">Recent Activity</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Daily consumption breakdown</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-[10px] font-black text-charcoal-muted hover:bg-blue-electric/5 hover:text-blue-electric hover:border-blue-electric/20 transition-all uppercase tracking-widest shadow-sm">
                <Download size={14} /> Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-4 pl-2">Date</th>
                  <th className="pb-4">Day</th>
                  <th className="pb-4">Total Calls</th>
                  <th className="pb-4 pr-2 text-right">Consumption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!usage?.daily_usage || usage.daily_usage.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                          <Calendar size={24} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">No usage data for this period</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usage.daily_usage.map((row: any, i: number) => {
                    const dateObj = parseISO(row.date);
                    return (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-2 font-black text-charcoal">{format(dateObj, 'MMM d, yyyy')}</td>
                        <td className="py-5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">{format(dateObj, 'EEEE')}</td>
                        <td className="py-5 text-charcoal-muted font-black">{row.calls} Calls</td>
                        <td className="py-5 pr-2 text-right">
                          <span className={`inline-flex items-center rounded-xl bg-blue-electric/10 px-3 py-1.5 text-[11px] font-black text-blue-electric border border-blue-electric/20 ring-1 ring-blue-electric/10 shadow-sm`}>
                            {row.minutes.toFixed(1)} mins
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
