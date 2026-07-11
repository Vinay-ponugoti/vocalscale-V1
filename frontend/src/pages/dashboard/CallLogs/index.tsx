import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useCallLogStats, useCallLogs } from '../../../hooks/useCallLogs';
import { fetchCallLog, useCallLog } from '../../../hooks/useCallLog';
import { useSearch } from '../../../hooks/useSearch';
import type { CallLogFilters } from './types';
import LogList from './components/LogList';
import LogDetails from './components/LogDetails';
import { Loader2, ArrowLeft, RefreshCw, XCircle, FileText, Calendar, ChevronRight, Search, Download, PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { exportCallsToExcel, EXPORT_RANGE_OPTIONS, type ExportRange } from './exportCalls';

const PAGE_SIZE = 8;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

const CallLogsPage = () => {
  const queryClient = useQueryClient();
  const { callId } = useParams<{ callId?: string }>();
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const selectedLogId = callId || null;
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [filters, setFilters] = useState<CallLogFilters>({
    search: searchQuery,
    status: 'All',
    type: 'All',
    dateRange: '7d',
    direction: 'All'
  });

  const [customDate, setCustomDate] = useState<string>('');
  const [page, setPage] = useState(1);

  const { state: businessState } = useBusinessSetup();
  const timezone = businessState.data.business.timezone || 'America/New_York';
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingRange, setExportingRange] = useState<ExportRange | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen]);

  const handleExport = async (range: ExportRange) => {
    setExportError(null);
    setExportingRange(range);
    try {
      const count = await exportCallsToExcel(range, timezone);
      setExportMenuOpen(false);
      if (count === 0) setExportError('No calls found for that range.');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExportingRange(null);
    }
  };

  useEffect(() => {
    if (searchQuery !== prevSearchQuery) {
      setPrevSearchQuery(searchQuery);
      setFilters(prev => ({ ...prev, search: searchQuery }));
      setPage(1);
    }
  }, [prevSearchQuery, searchQuery]);

  const handleSelectLog = (id: string | null) => {
    if (id) {
      navigate(`/dashboard/calls/${id}`);
    } else {
      navigate('/dashboard/calls');
    }
  };

  const debouncedFilters = useDebouncedValue(filters, 300);
  const debouncedCustomDate = useDebouncedValue(customDate, 300);
  const queryFilters = useMemo(() => ({ ...debouncedFilters, customDate: debouncedCustomDate }), [debouncedCustomDate, debouncedFilters]);

  const { logs, total, loading: listLoading, isPlaceholderData, error: listError, refetch } = useCallLogs(queryFilters, page, PAGE_SIZE);
  const { stats: serverStats, refetch: refetchStats } = useCallLogStats(queryFilters);
  const { log: singleLog, loading: singleLoading } = useCallLog(callId);

  const isInitialLoading = listLoading && !isPlaceholderData;

  const stats = serverStats || {
    callsToday: 0,
    callsTrend: '0%',
    callsTrendUp: true,
    missedCalls: 0,
    handledRate: 0,
    followUpCalls: 0,
    avgDuration: '0s',
    total: 0
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setCustomDate(date);
    setPage(1);
    if (date) {
      handleFilterChange('dateRange', 'Custom');
    }
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'All',
      type: 'All',
      dateRange: '7d',
      direction: 'All'
    });
    setCustomDate('');
    setPage(1);
  };

  const selectedLog = callId ? singleLog : logs.find(l => l.id === selectedLogId);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePrefetchLog = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['call-log', id],
      queryFn: ({ signal }) => fetchCallLog(id, signal),
      staleTime: 60000
    });
  };

  // Each stat is a one-click filter shortcut — the alarm ("19 missed") and
  // the action (see those calls) should be the same element.
  const compactStats = [
    { label: 'Today', value: stats.callsToday, detail: `${stats.callsTrend} vs yesterday`, tone: 'text-slate-950', accent: 'border-slate-200', filter: { status: 'All', dateRange: '24h' } },
    { label: 'Missed', value: stats.missedCalls, detail: 'needs review', tone: 'text-rose-600', accent: 'border-rose-100 bg-rose-50/40', filter: { status: 'Missed' } },
    { label: 'Handled', value: `${stats.handledRate}%`, detail: 'completed', tone: 'text-emerald-600', accent: 'border-emerald-100 bg-emerald-50/40', filter: { status: 'Completed' } },
    { label: 'Follow-ups', value: stats.followUpCalls, detail: 'needs callback', tone: 'text-amber-600', accent: 'border-amber-100 bg-amber-50/40', filter: { status: 'Action Req' } }
  ];

  const applyStatShortcut = (filter: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...filter }));
    setPage(1);
  };

  const listControls = (
    <div className="space-y-3 border-b border-slate-200 bg-white p-4">
      {/* Inbound / Outbound tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {(['All', 'Inbound', 'Outbound'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => handleFilterChange('direction', dir)}
            className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-bold transition ${filters.direction === dir
              ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            {dir === 'Inbound' && <PhoneIncoming size={13} className={filters.direction === dir ? 'text-cyan-600' : ''} />}
            {dir === 'Outbound' && <PhoneOutgoing size={13} className={filters.direction === dir ? 'text-indigo-600' : ''} />}
            {dir}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search caller, phone, or summary..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Action Req">Action Required</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="All">All Types</option>
            <option value="Booking">Booking</option>
            <option value="Inquiry">Inquiry</option>
            <option value="General">General</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition hover:border-slate-300 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
          <Calendar size={14} className="text-slate-400 group-focus-within:text-slate-900" />
          <input
            type="date"
            value={customDate}
            onChange={handleCustomDateChange}
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => {
              handleFilterChange('dateRange', e.target.value);
              if (e.target.value !== 'Custom') setCustomDate('');
            }}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:w-[116px]"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="Custom" disabled={!customDate}>Custom Date</option>
            <option value="All">All Time</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-9 w-full shrink-0 rounded-lg border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 sm:w-9"
          title="Reset Filters"
        >
          <RefreshCw size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout fullWidth>
      <div className="flex h-full flex-col gap-3 overflow-y-auto bg-[hsl(var(--ds-off-white))] px-3 py-3 text-slate-950 md:gap-4 md:overflow-hidden md:px-6 md:py-4 lg:px-8">

        <div className="shrink-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Call Logs</h1>
                <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {total} total
                </span>
              </div>
              <p className="mt-0.5 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                Triage missed calls, review follow-ups, and open the transcript.
              </p>
            </div>

            <div className="flex min-w-0 items-stretch gap-2">
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:flex-none">
                {compactStats.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => applyStatShortcut(item.filter)}
                    title={`Show ${item.label.toLowerCase()} calls`}
                    className={`min-w-0 rounded-lg border bg-white px-2.5 py-1.5 text-left shadow-sm shadow-slate-200/50 transition hover:shadow focus:outline-none focus:ring-2 focus:ring-cyan-100 sm:px-3 lg:w-[140px] xl:w-[160px] ${item.accent}`}
                  >
                    <div className="flex items-start justify-between gap-2 sm:items-baseline">
                      <span className="truncate text-xs font-semibold text-slate-500">{item.label}</span>
                      <span className={`text-sm font-black sm:text-base ${item.tone}`}>{item.value}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-400">{item.detail}</p>
                  </button>
                ))}
              </div>
              <div ref={exportRef} className="relative shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportMenuOpen((open) => !open)}
                  title="Export to Excel"
                  className="h-full gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  {exportingRange ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  <span className="hidden sm:inline">Export</span>
                  <ChevronRight size={13} className={`text-slate-400 transition-transform ${exportMenuOpen ? '-rotate-90' : 'rotate-90'}`} />
                </Button>
                {exportMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/60 animate-in fade-in zoom-in-95 duration-150">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Export to Excel
                    </p>
                    {EXPORT_RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleExport(option.value)}
                        disabled={exportingRange !== null}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {option.label}
                        {exportingRange === option.value && <Loader2 size={13} className="animate-spin text-cyan-600" />}
                      </button>
                    ))}
                    {exportError && (
                      <p className="border-t border-slate-100 px-3 py-2 text-[11px] font-medium text-rose-600">{exportError}</p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  refetch();
                  refetchStats();
                }}
                title="Refresh"
                className="h-auto w-10 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              >
                <RefreshCw size={15} />
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-0 md:flex-1">
          <div className="relative flex w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 animate-in fade-in duration-300 md:h-full md:flex-row">

            <div className={`
              ${selectedLogId ? 'hidden md:flex' : 'flex'} 
              min-h-0 w-full flex-col bg-white overflow-hidden shrink-0 md:h-full md:w-[360px] md:border-r md:border-slate-200 xl:w-[400px] 2xl:w-[430px]
            `}>
              {listControls}
              {listError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-500 ring-1 ring-rose-500/10">
                    <XCircle size={28} />
                  </div>
                  <h3 className="mb-1 text-base font-semibold tracking-tight text-slate-950">Failed to load logs</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-[240px]">{listError}</p>
                  <Button variant="outline" onClick={() => refetch()} className="text-xs font-semibold text-slate-900">Try again</Button>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <LogList
                    logs={logs}
                    selectedId={selectedLogId}
                    onSelect={handleSelectLog}
                    onPrefetch={handlePrefetchLog}
                    isLoading={isInitialLoading}
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                  {isPlaceholderData && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md animate-in fade-in zoom-in duration-300">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-600" />
                        <span className="text-xs font-semibold text-slate-900">Updating logs...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Detail View */}
            <div className={`
              ${selectedLogId ? 'flex' : 'hidden md:flex'} 
              scrollbar-hide min-h-0 min-w-0 flex-1 bg-[hsl(var(--ds-off-white))] overflow-y-auto relative
            `}>
              {selectedLogId ? (
                singleLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-cyan-50 ring-1 ring-cyan-500/10">
                      <Loader2 className="animate-spin text-cyan-600" size={32} />
                    </div>
                    <p className="text-base font-semibold tracking-tight text-slate-950">Loading call details...</p>
                  </div>
                ) : selectedLog ? (
                  <div className="min-h-full w-full p-3 animate-in fade-in slide-in-from-right-2 duration-300 md:p-4">
                    <button
                      onClick={() => handleSelectLog(null)}
                      className="mb-3 flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:text-slate-900 md:hidden"
                    >
                      <ArrowLeft size={14} />
                      Back to List
                    </button>
                    <LogDetails log={selectedLog} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-rose-50 ring-1 ring-rose-500/10">
                      <XCircle className="text-rose-500" size={32} />
                    </div>
                    <h2 className="mb-3 text-xl font-black tracking-tight text-slate-950">Log Not Found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">
                      The requested call record could not be retrieved. It may have been archived or deleted from our servers.
                    </p>
                    <Button
                      onClick={() => handleSelectLog(null)}
                      variant="outline"
                      className="text-xs font-semibold text-slate-900"
                    >
                      Return to List
                    </Button>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                    <FileText size={30} className="text-slate-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-black tracking-tight text-slate-950">Select a call</h3>
                  <p className="max-w-xs mx-auto text-slate-500 text-sm font-medium leading-6">
                    Choose a call from the list to review the summary, transcript, and follow-up details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallLogsPage;
