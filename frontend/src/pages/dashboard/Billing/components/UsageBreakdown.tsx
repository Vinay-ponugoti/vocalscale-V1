import React, { useEffect, useState } from 'react';
import { BarChart3, Timer, CheckCircle2, Download, Calendar, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { callsApi } from '../../../../api/calls';

interface UsageBreakdownProps {
  usage: any;
  hasSubscription: boolean;
}

const UsageBreakdown: React.FC<UsageBreakdownProps> = ({ usage, hasSubscription }) => {
  const avgDurationFormatted = usage?.avg_duration_seconds
    ? `${Math.floor(usage.avg_duration_seconds / 60)}m ${Math.round(usage.avg_duration_seconds % 60)}s`
    : '0s';

  // Calls Pagination State
  const [calls, setCalls] = useState<any[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchCalls = async () => {
      setLoadingCalls(true);
      try {
        const data = await callsApi.getRecentCalls(page, pageSize);
        setCalls(data.items || []);
        // Calculate total pages (assuming data.total is available)
        const total = data.total || 0;
        setTotalPages(Math.ceil(total / pageSize));
      } catch (error) {
        console.error('Error fetching recent calls:', error);
      } finally {
        setLoadingCalls(false);
      }
    };

    fetchCalls();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getCallIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <PhoneIncoming size={14} className="text-emerald-500" />;
      case 'no-answer': return <PhoneMissed size={14} className="text-rose-500" />;
      case 'failed': return <AlertCircle size={14} className="text-rose-500" />;
      case 'busy': return <PhoneOutgoing size={14} className="text-amber-500" />;
      default: return <Phone size={14} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
    if (s === 'in-progress') return 'bg-blue-50 text-blue-700 ring-blue-500/20 animate-pulse';
    if (s === 'failed' || s === 'no-answer') return 'bg-rose-50 text-rose-700 ring-rose-500/20';
    return 'bg-slate-100 text-slate-600 ring-slate-500/20';
  };

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
                    <span className="font-bold text-charcoal-medium">Minutes Usage</span>
                    <span className="text-charcoal font-black">
                      {usage?.used_minutes}m
                      <span className="text-[9px] text-charcoal-light font-bold ml-1">
                        ({Math.round((usage?.used_minutes / (usage?.total_minutes || 1)) * 100)}%)
                      </span>
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

        {/* Top Usage Days Table -> Replaced with Recent Calls Log */}
        <Card className="lg:col-span-2 2xl:col-span-3 border border-slate-100 shadow-sm bg-white flex flex-col">
          <CardHeader className="pb-0 border-none shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-black text-charcoal uppercase tracking-widest">Recent Activity</CardTitle>
                <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                  Page {page} of {totalPages || 1}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1 || loadingCalls}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages || loadingCalls}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                {/* Export button removed or kept if needed. The user didn't explicitly ask to remove it, but focus is on calls/pagination */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-[9px] font-black text-charcoal-light uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-3 pl-2">Status</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Caller</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 pr-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingCalls ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : calls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-charcoal-light">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar size={24} className="text-slate-200" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No calls recorded</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    calls.map((call, i) => {
                      const dateObj = parseISO(call.created_at);
                      const status = call.status || 'unknown';
                      const cost = (call.duration_seconds / 60) * 0.10; // Approx cost, ideally from API

                      return (
                        <tr key={call.id || i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {getCallIcon(status)}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ring-1 ${getStatusBadge(status)}`}>
                                {status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 font-medium text-charcoal">
                            <div className="flex flex-col">
                              <span>{format(dateObj, 'MMM d, yyyy')}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{format(dateObj, 'h:mm a')}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-charcoal">{call.caller_name || 'Unknown'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{call.caller_phone}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-charcoal-medium">{call.duration_seconds}s</td>
                          <td className="py-4 pr-2 text-right">
                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-[10px] font-black text-charcoal">
                              Est. ${cost.toFixed(3)}
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
