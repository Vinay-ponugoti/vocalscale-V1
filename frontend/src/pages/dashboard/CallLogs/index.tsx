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
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { WORKSPACE_CONTAINER } from '../../../constants/layout';
import { cn } from '../../../lib/utils';
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
    { label: 'Today', value: stats.callsToday, detail: `${stats.callsTrend} vs yesterday`, tone: '', filter: { status: 'All', dateRange: '24h' } },
    { label: 'Missed', value: stats.missedCalls, detail: 'Need review', tone: 'text-rose-600', filter: { status: 'Missed' } },
    { label: 'Answered', value: `${stats.handledRate}%`, detail: 'Answer rate', tone: 'text-emerald-600', filter: { status: 'Completed' } },
    { label: 'Needs attention', value: stats.followUpCalls, detail: 'Follow-up required', tone: 'text-amber-600', filter: { status: 'Action Req' } }
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
            {dir === 'Inbound' && <PhoneIncoming size={13} className={filters.direction === dir ? 'text-blue-600' : ''} />}
            {dir === 'Outbound' && <PhoneOutgoing size={13} className={filters.direction === dir ? 'text-blue-600' : ''} />}
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
          placeholder="Search caller, phone, or summary…"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All statuses</option>
            <option value="Completed">Answered</option>
            <option value="Missed">Missed</option>
            <option value="Action Req">Needs attention</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In progress</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All types</option>
            <option value="Booking">Appointment</option>
            <option value="Inquiry">Inquiry</option>
            <option value="General">General</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-[116px]"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="Custom" disabled={!customDate}>Custom date</option>
            <option value="All">All time</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-9 w-full shrink-0 rounded-lg border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 sm:w-9"
          title="Reset filters"
          aria-label="Reset filters"
        >
          <RefreshCw size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout fullWidth>
      <div className={cn(WORKSPACE_CONTAINER, 'overflow-y-auto md:overflow-hidden')}>
        <PageHeader
          title="Call logs"
          meta={<span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{total} total</span>}
          description="Review missed calls, follow-ups, and transcripts."
          actions={
            <>
              <div ref={exportRef} className="relative">
                <Button variant="outline" onClick={() => setExportMenuOpen((open) => !open)} title="Export to Excel">
                  {exportingRange ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Export
                  <ChevronRight size={13} className={`text-slate-400 transition-transform ${exportMenuOpen ? '-rotate-90' : 'rotate-90'}`} />
                </Button>
                {exportMenuOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                        {exportingRange === option.value && <Loader2 size={13} className="animate-spin text-blue-600" />}
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
                aria-label="Refresh"
              >
                <RefreshCw size={15} />
              </Button>
            </>
          }
        />

        {/* Each stat is a one-click filter shortcut. */}
        <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {compactStats.map((item) => (
            <StatCard
              key={item.label}
              compact
              label={item.label}
              value={item.value}
              valueClassName={item.tone}
              description={item.detail}
              onClick={() => applyStatShortcut(item.filter)}
            />
          ))}
        </div>

        <div className="min-h-0 md:flex-1">
          <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:h-full md:flex-row">

            <div className={`
              ${selectedLogId ? 'hidden md:flex' : 'flex'} 
              min-h-0 w-full flex-col bg-white overflow-hidden shrink-0 md:h-full md:w-[360px] md:border-r md:border-slate-200 xl:w-[400px] 2xl:w-[430px]
            `}>
              {listControls}
              {listError ? (
                <EmptyState
                  icon={XCircle}
                  tone="danger"
                  title="Couldn't load calls"
                  description={listError}
                  action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
                  className="flex-1"
                />
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
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                        <span className="text-xs font-semibold text-slate-900">Updating…</span>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm z-20">
                    <Loader2 className="animate-spin text-blue-600" size={28} />
                    <p className="text-sm font-medium text-slate-600">Loading call…</p>
                  </div>
                ) : selectedLog ? (
                  <div className="min-h-full w-full p-3 animate-in fade-in slide-in-from-right-2 duration-300 md:p-4">
                    <button
                      onClick={() => handleSelectLog(null)}
                      className="mb-3 flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:text-slate-900 md:hidden"
                    >
                      <ArrowLeft size={14} />
                      Back to call logs
                    </button>
                    <LogDetails log={selectedLog} />
                  </div>
                ) : (
                  <EmptyState
                    icon={XCircle}
                    tone="danger"
                    title="Call not found"
                    description="This call may have been archived or deleted."
                    action={<Button variant="outline" onClick={() => handleSelectLog(null)}>Back to call logs</Button>}
                    className="h-full w-full"
                  />
                )
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Select a call"
                  description="Choose a call from the list to see its summary, transcript, and follow-up."
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallLogsPage;
