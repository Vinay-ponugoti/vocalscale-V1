import React, { useEffect, useState } from 'react';
import { BarChart3, Timer, CheckCircle2, Calendar, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, ReceiptText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { StatCard } from '../../../../components/ui/StatCard';
import { callsApi } from '../../../../api/calls';

interface UsageData {
  avg_duration_seconds?: number;
  used_minutes?: number;
  total_minutes?: number;
  minutes_used?: number;
  minutes_limit?: number;
  usage_percent?: number;
  success_rate?: number;
  overage_minutes?: number;
  estimated_cost?: number;
  total_calls?: number;
  calls_count?: number;
  billable_minutes?: number;
  inbound_minutes?: number;
  outbound_minutes?: number;
  inbound_calls?: number;
  outbound_calls?: number;
  pending_calls?: number;
  overage_rate?: number;
  last_updated_at?: string;
}

interface CallItem {
  id?: string;
  created_at: string;
  status?: string;
  caller_name?: string;
  caller_phone?: string;
  duration_seconds: number;
  direction?: 'inbound' | 'outbound';
}

interface UsageBreakdownProps {
  usage: UsageData;
  hasSubscription?: boolean;
}

const BILLING_STEPS = [
  'Connected call time is recorded to the second',
  'Inbound and outbound calls use your plan minutes',
  'Only minutes above your plan limit add overage',
];

const UsageBreakdown: React.FC<UsageBreakdownProps> = ({ usage }) => {
  const usedMinutes = usage?.used_minutes ?? usage?.minutes_used ?? 0;
  const totalMinutes = usage?.total_minutes ?? usage?.minutes_limit ?? 0;
  const usagePercent = totalMinutes > 0
    ? Math.min(100, Math.max(0, usage?.usage_percent ?? ((usedMinutes / totalMinutes) * 100)))
    : 0;
  const overageMinutes = usage?.overage_minutes ?? Math.max(0, usedMinutes - totalMinutes);
  const estimatedCost = usage?.estimated_cost ?? (overageMinutes * 0.089);
  const totalCalls = usage?.total_calls ?? usage?.calls_count ?? 0;
  const inboundMinutes = usage?.inbound_minutes ?? 0;
  const outboundMinutes = usage?.outbound_minutes ?? 0;
  const inboundCalls = usage?.inbound_calls ?? 0;
  const outboundCalls = usage?.outbound_calls ?? 0;
  const pendingCalls = usage?.pending_calls ?? 0;
  const overageRate = usage?.overage_rate ?? 0.089;
  const successRate = usage?.success_rate ?? (totalCalls > 0 ? 0 : 100);
  const avgDurationFormatted = usage?.avg_duration_seconds
    ? `${Math.floor(usage.avg_duration_seconds / 60)}m ${Math.round(usage.avg_duration_seconds % 60)}s`
    : '0s';

  // Calls Pagination State
  const [calls, setCalls] = useState<CallItem[]>([]);
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



  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <BarChart3 size={16} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Usage</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Left Stats Column */}
        <div className="flex flex-col gap-4 lg:col-span-1 lg:gap-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Timer} tint="slate" label="Avg duration" value={avgDurationFormatted} description="Per call" />
            <StatCard icon={CheckCircle2} tint="emerald" label="Success rate" value={`${successRate.toFixed(1)}%`} description="Completed vs attempted" />
            <StatCard
              icon={Timer}
              tint="amber"
              label="Overage"
              value={overageMinutes > 0 ? `${overageMinutes.toFixed(1)} min` : '0 min'}
              description="Billed separately"
            />
            <StatCard icon={BarChart3} label="Total calls" value={totalCalls} description="This cycle" />
          </div>

          {/* Minute Distribution Card */}
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Billable minutes</h3>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-emerald-700"><ArrowDownLeft size={13} /><span className="text-[11px] font-semibold uppercase tracking-wider">Inbound</span></div>
                    <p className="text-lg font-semibold text-slate-900">{inboundMinutes.toFixed(2)}m</p>
                    <p className="text-xs text-emerald-700">{inboundCalls} calls</p>
                  </div>
                  <div className="rounded-lg border border-violet-100 bg-violet-50 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-violet-700"><ArrowUpRight size={13} /><span className="text-[11px] font-semibold uppercase tracking-wider">Outbound</span></div>
                    <p className="text-lg font-semibold text-slate-900">{outboundMinutes.toFixed(2)}m</p>
                    <p className="text-xs text-violet-700">{outboundCalls} calls</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium text-slate-700">Plan usage</span>
                    <span className="text-slate-900 font-semibold">
                      {usedMinutes.toFixed(2)}m
                      <span className="ml-1 font-normal text-slate-500">
                        ({Math.round(usagePercent)}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${usedMinutes > 0 ? (inboundMinutes / usedMinutes) * usagePercent : 0}%` }} />
                    <div className="h-full bg-violet-500 transition-all duration-1000" style={{ width: `${usedMinutes > 0 ? (outboundMinutes / usedMinutes) * usagePercent : 0}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Estimated overage cost</span>
                  <span className="font-semibold text-slate-900">
                    {overageMinutes > 0
                      ? `$${estimatedCost.toFixed(2)}`
                      : '$0.00'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  Both inbound and outbound connected seconds count toward your plan. Overage is ${overageRate.toFixed(3)}/minute.
                  {pendingCalls > 0 ? ` ${pendingCalls} call${pendingCalls === 1 ? '' : 's'} still processing.` : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Usage Days Table -> Replaced with Recent Calls Log */}
        <Card className="lg:col-span-2 rounded-xl border border-slate-200 shadow-sm bg-white flex flex-col">
          <CardHeader className="pb-0 border-none shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold text-slate-900">Recent activity</CardTitle>
                <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
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
                  <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">

                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Direction</th>
                    <th className="pb-3">Caller</th>
                    <th className="pb-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingCalls ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : calls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar size={24} className="text-slate-200" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider">No calls recorded</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    calls.map((call, i) => {
                      const dateObj = parseISO(call.created_at);
                      return (
                        <tr key={call.id || i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-medium text-slate-900">
                            <div className="flex flex-col">
                              <span>{format(dateObj, 'MMM d, yyyy')}</span>
                              <span className="text-xs text-slate-500">{format(dateObj, 'h:mm a')}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${call.direction === 'outbound' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {call.direction === 'outbound' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                              {call.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{call.caller_name || 'Unknown'}</span>
                              <span className="text-xs text-slate-500 font-mono">{call.caller_phone}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-slate-700">{call.duration_seconds}s</td>
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

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ReceiptText size={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">How your bill is calculated</h3>
              <p className="text-xs text-slate-500">Three steps, every billing cycle.</p>
            </div>
          </div>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {BILLING_STEPS.map((step, i) => (
              <li key={step} className="flex h-full items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {i + 1}
                </span>
                <span className="text-sm leading-6 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageBreakdown;
