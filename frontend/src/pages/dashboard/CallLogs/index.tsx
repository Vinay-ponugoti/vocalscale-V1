import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useCallLogs } from '../../../hooks/useCallLogs';
import { useCallLog } from '../../../hooks/useCallLog';
import { useSearch } from '../../../hooks/useSearch';
import type { CallLogFilters } from './types';
import LogList from './components/LogList';
import LogDetails from './components/LogDetails';
import { Loader2, ArrowLeft, RefreshCw, Phone, XCircle, Zap, Clock, Calendar, ChevronRight } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full p-2 md:p-0">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
        <div className="relative shrink-0">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronRight size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <div className="relative shrink-0">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
          >
            <option value="All">All Types</option>
            <option value="Booking">Booking</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Urgent">Urgent</option>
            <option value="General">General</option>
          </select>
          <ChevronRight size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </div>

        <div className="hidden md:block h-6 w-[1px] bg-slate-200 mx-1" />

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl group focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-500 transition-all hover:border-slate-300 shadow-sm">
            <Calendar size={12} className="text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="date"
              value={customDate}
              onChange={handleCustomDateChange}
              className="bg-transparent text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none w-24 cursor-pointer"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={filters.dateRange}
              onChange={(e) => {
                handleFilterChange('dateRange', e.target.value);
                if (e.target.value !== 'Custom') setCustomDate('');
              }}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 shadow-sm"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="Custom" disabled={!customDate}>Custom</option>
              <option value="All">All Time</option>
            </select>
            <ChevronRight size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95 border border-transparent hover:border-indigo-100 flex items-center gap-2"
        >
          <RefreshCw size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout fullWidth secondaryNav={filtersNav}>
      <div className="w-full h-full flex flex-col bg-slate-50/50">

        {/* --- Stats Summary Bar --- */}
        <div className="p-4 md:p-6 lg:p-8 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-4 md:p-6 flex items-center gap-5 shadow-sm min-w-[200px] md:min-w-[240px] flex-1 md:flex-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
                <Phone size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">Total Calls</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.callsToday}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${stats.callsTrendUp
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                    }`}>
                    {stats.callsTrend}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-4 md:p-6 flex items-center gap-5 shadow-sm min-w-[180px] md:min-w-[220px] flex-1 md:flex-none">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                <Zap size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">Urgent Action</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.urgentToday}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-4 md:p-6 flex items-center gap-5 shadow-sm min-w-[180px] md:min-w-[220px] flex-1 md:flex-none">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <Clock size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">Avg Duration</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{stats.avgDuration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Content Area: Split View --- */}
        <div className="flex-1 flex overflow-hidden w-full relative">

          {/* Left Panel: Master List */}
          <div className={`
            ${selectedLogId ? 'hidden md:flex' : 'flex'} 
            w-full md:w-[400px] lg:w-[460px] border-r border-slate-100 flex-col bg-white overflow-hidden shrink-0 transition-all duration-500
          `}>
            {listError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-rose-500 border border-rose-100">
                  <XCircle size={32} />
                </div>
                <h3 className="text-slate-900 font-black text-base uppercase tracking-tight mb-2">Sync Error</h3>
                <p className="text-slate-500 text-[11px] font-medium mb-8 max-w-[240px] uppercase tracking-widest leading-relaxed">{listError}</p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="rounded-xl px-8 font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50"
                >
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden relative">
                <LogList
                  logs={logs}
                  selectedId={selectedLogId}
                  onSelect={handleSelectLog}
                  isLoading={isInitialLoading}
                />
                {isPlaceholderData && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-slate-900 text-white border border-slate-800 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                      <Loader2 size={12} className="animate-spin" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Syncing...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Detail View */}
          <div className={`
            ${selectedLogId ? 'flex' : 'hidden md:flex'} 
            flex-1 bg-white overflow-y-auto custom-scrollbar relative transition-all duration-500
          `}>
            {selectedLogId ? (
              singleLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md z-20 animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  </div>
                  <p className="text-slate-900 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Analyzing Call Intelligence</p>
                </div>
              ) : selectedLog ? (
                <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-8 duration-700 w-full max-w-5xl mx-auto">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => handleSelectLog(null)}
                    className="md:hidden flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-slate-900 transition-colors group"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                      <ArrowLeft size={16} />
                    </div>
                    Back to Call Stream
                  </button>
                  <LogDetails log={selectedLog} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-rose-50 rounded-[3rem] flex items-center justify-center mb-10 ring-1 ring-rose-100 shadow-xl shadow-rose-50">
                    <XCircle className="text-rose-500" size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Identity Void</h2>
                  <p className="text-slate-500 max-w-sm mx-auto mb-10 text-[11px] font-black uppercase tracking-[0.15em] leading-relaxed">
                    This interaction record is unreachable or has been purged from system history.
                  </p>
                  <Button
                    onClick={() => handleSelectLog(null)}
                    variant="outline"
                    className="rounded-2xl px-10 h-12 font-black text-[10px] uppercase tracking-[0.2em] border-slate-200 hover:bg-slate-50"
                  >
                    Return to Stream
                  </Button>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-1000">
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50">
                    <Phone size={48} className="text-slate-200" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-bounce">
                    <Zap size={20} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase">Select Conversation</h3>
                <p className="max-w-xs mx-auto text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] leading-relaxed">
                  Choose a call from the archive to unlock full analysis and voice recordings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CallLogsPage;
