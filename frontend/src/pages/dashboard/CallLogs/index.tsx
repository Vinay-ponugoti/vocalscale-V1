import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useCallLogs } from '../../../hooks/useCallLogs';
import { useCallLog } from '../../../hooks/useCallLog';
import { useSearch } from '../../../hooks/useSearch';
import type { CallLogFilters } from './types';
import LogList from './components/LogList';
import LogDetails from './components/LogDetails';
import { Loader2, ArrowLeft, RefreshCw, Phone, XCircle, FileText, Zap, Clock, Calendar, ChevronRight } from 'lucide-react';
import { startOfDay, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Button } from '../../../components/ui/Button';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';

const CallLogsPage = () => {
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';
  const { callId } = useParams<{ callId?: string }>();
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const selectedLogId = callId || null;
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [filters, setFilters] = useState<CallLogFilters>({
    search: searchQuery,
    status: 'All',
    type: 'All',
    dateRange: '7d'
  });

  // Sync global search query with local filters
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }

  const [customDate, setCustomDate] = useState<string>('');

  const handleSelectLog = (id: string | null) => {
    if (id) {
      navigate(`/dashboard/calls/${id}`);
    } else {
      navigate('/dashboard/calls');
    }
  };

  const { logs, loading: listLoading, isPlaceholderData, error: listError, refetch } = useCallLogs({ ...filters, customDate });
  const { log: singleLog, loading: singleLoading } = useCallLog(callId);

  const isInitialLoading = listLoading && !isPlaceholderData;

  // --- Stats Calculation ---
  const stats = (() => {
    const now = toZonedTime(new Date(), timezone);
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const validLogs = logs.filter(log => log.created_at);

    const todayLogs = validLogs.filter(l => {
      const date = toZonedTime(parseISO(l.created_at), timezone);
      return isAfter(date, todayStart);
    });
    const yesterdayLogs = validLogs.filter(l => {
      const date = toZonedTime(parseISO(l.created_at), timezone);
      return isAfter(date, yesterdayStart) && isBefore(date, todayStart);
    });

    const callsToday = todayLogs.length;
    const callsYesterday = yesterdayLogs.length;
    const callsTrend = callsYesterday > 0 ? Math.round(((callsToday - callsYesterday) / callsYesterday) * 100) : (callsToday > 0 ? 100 : 0);

    const urgentToday = todayLogs.filter(l => l.is_urgent || l.status?.includes('Action')).length;

    const avgDuration = todayLogs.length > 0
      ? Math.round(todayLogs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / todayLogs.length)
      : 0;

    return {
      callsToday,
      callsTrend: `${callsTrend > 0 ? '+' : ''}${callsTrend}%`,
      callsTrendUp: callsTrend >= 0,
      urgentToday,
      avgDuration: avgDuration > 60 ? `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s` : `${avgDuration}s`
    };
  })();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setCustomDate(date);
    if (date) {
      handleFilterChange('dateRange', 'Custom');
    }
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'All',
      type: 'All',
      dateRange: '7d'
    });
    setCustomDate('');
  };

  const selectedLog = callId ? singleLog : logs.find(l => l.id === selectedLogId);

  const filtersNav = (
    <div className="flex items-center gap-4 w-full">
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-tight pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-tight pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
          >
            <option value="All">All Types</option>
            <option value="Booking">Booking</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Urgent">Urgent</option>
            <option value="General">General</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      <div className="h-6 w-[1px] bg-slate-200 mx-1" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl group focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all hover:border-slate-300 shadow-sm">
          <Calendar size={14} className="text-slate-400 group-focus-within:text-indigo-500" />
          <input
            type="date"
            value={customDate}
            onChange={handleCustomDateChange}
            className="bg-transparent text-[11px] font-black text-slate-700 uppercase tracking-tight outline-none w-28 cursor-pointer"
          />
        </div>

        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => {
              handleFilterChange('dateRange', e.target.value);
              if (e.target.value !== 'Custom') setCustomDate('');
            }}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-tight pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="Custom" disabled={!customDate}>Custom Date</option>
            <option value="All">All Time</option>
          </select>
          <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleReset}
        className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 ml-auto border border-transparent hover:border-indigo-100"
        title="Reset Filters"
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );

  return (
    <DashboardLayout fullWidth secondaryNav={filtersNav}>
      <div className="flex flex-col h-full bg-slate-50/50 p-4 md:p-6 2xl:p-8 overflow-hidden">

        {/* Unified Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden w-full max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">

          {/* Top Bar: Integrated Stats */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-8 bg-white shrink-0 overflow-x-auto no-scrollbar">
            {/* Stats Items */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-500/10">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{stats.callsToday}</span>
                  <span className={`text-[10px] font-bold ${stats.callsTrendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats.callsTrend}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-100" />

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 ring-1 ring-rose-500/10">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Urgent</p>
                <span className="text-sm font-black text-slate-900">{stats.urgentToday}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-100" />

            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 ring-1 ring-amber-500/10">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Avg Time</p>
                <span className="text-sm font-black text-slate-900">{stats.avgDuration}</span>
              </div>
            </div>
          </div>

          {/* Main Content Area: Split View */}
          <div className="flex-1 flex overflow-hidden w-full relative">

            {/* Left Panel: Master List */}
            <div className={`
              ${selectedLogId ? 'hidden md:flex' : 'flex'} 
              w-full md:w-[380px] lg:w-[420px] border-r border-slate-100 flex-col bg-slate-50/30 overflow-hidden shrink-0
            `}>
              {listError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500 ring-1 ring-red-500/10">
                    <XCircle size={28} />
                  </div>
                  <h3 className="text-slate-900 font-black text-base tracking-tight mb-1">Failed to load logs</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-[240px]">{listError}</p>
                  <Button variant="outline" onClick={() => refetch()} className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Try again</Button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <LogList
                    logs={logs}
                    selectedId={selectedLogId}
                    onSelect={handleSelectLog}
                    isLoading={isInitialLoading}
                  />
                  {isPlaceholderData && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-white/90 backdrop-blur-md border border-indigo-100 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Updating Logs...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel: Detail View */}
            <div className={`
              ${selectedLogId ? 'flex' : 'hidden md:flex'} 
              flex-1 bg-white overflow-y-auto custom-scrollbar relative
            `}>
              {selectedLogId ? (
                singleLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6 ring-1 ring-indigo-500/10">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                    <p className="text-slate-900 font-black text-base tracking-tight">Analyzing Call Data...</p>
                  </div>
                ) : selectedLog ? (
                  <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-2 duration-300 w-full max-w-5xl mx-auto">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => handleSelectLog(null)}
                      className="md:hidden flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Back to List
                    </button>
                    <LogDetails log={selectedLog} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 ring-1 ring-rose-500/10">
                      <XCircle className="text-rose-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Log Not Found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">
                      The requested call record could not be retrieved. It may have been archived or deleted from our servers.
                    </p>
                    <Button
                      onClick={() => handleSelectLog(null)}
                      variant="outline"
                      className="text-indigo-600 font-bold text-xs uppercase tracking-wider"
                    >
                      Return to List
                    </Button>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center mb-8 shadow-sm">
                    <FileText size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 uppercase">Select a Conversation</h3>
                  <p className="max-w-xs mx-auto text-slate-500 text-sm font-medium leading-relaxed">
                    Click on any call log from the left panel to view full transcripts, AI analysis, and recordings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E2E8F0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #CBD5E1;
            border-radius: 10px;
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default CallLogsPage;
