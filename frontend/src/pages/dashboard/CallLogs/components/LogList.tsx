import React, { useState } from 'react';
import {
  Clock, ChevronLeft, ChevronRight, Zap, Mic, Search
} from 'lucide-react';
import type { CallLog } from '../types';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { toZonedTime, format as formatTZ } from 'date-fns-tz';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useBusinessSetup } from '../../../../context/BusinessSetupContext';

interface LogListProps {
  logs: CallLog[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const LogList: React.FC<LogListProps> = ({ logs, selectedId, onSelect, isLoading }) => {
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';
  const [currentPage, setCurrentPage] = useState(1);
  const [prevLogs, setPrevLogs] = useState(logs);
  const itemsPerPage = 8;

  if (logs !== prevLogs) {
    setPrevLogs(logs);
    setCurrentPage(1);
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatLogDate = (dateStr: string) => {
    const date = toZonedTime(parseISO(dateStr), timezone);
    if (isToday(date)) return formatTZ(date, 'h:mm a', { timeZone: timezone });
    if (isYesterday(date)) return 'Yesterday';
    return formatTZ(date, 'MMM dd', { timeZone: timezone });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Booking':
        return <Badge variant="default" className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50 shadow-none font-black text-[11px] tracking-widest uppercase">Booking</Badge>;
      case 'Inquiry':
        return <Badge variant="default" className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50 shadow-none font-black text-[11px] tracking-widest uppercase">Inquiry</Badge>;
      case 'Urgent':
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 shadow-none font-black text-[11px] tracking-widest uppercase">Urgent</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-50 shadow-none font-black text-[11px] tracking-widest uppercase">{type || 'General'}</Badge>;
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-4 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-50/50 rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Modern Header */}
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Log</h2>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400">
            {logs.length}
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-[10px] font-black text-slate-400 w-12 text-center uppercase tracking-tighter">
            {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Search className="text-slate-200" size={32} />
            </div>
            <h3 className="text-slate-900 font-black text-sm uppercase tracking-tight">No results found</h3>
            <p className="text-slate-400 text-[11px] mt-1 font-bold uppercase tracking-wider">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {currentLogs.map((log) => {
              const isSelected = selectedId === log.id;
              const isUrgent = log.is_urgent || log.status?.includes('Action');

              return (
                <div
                  key={log.id}
                  onClick={() => onSelect(log.id)}
                  className={`
                    group px-6 py-5 cursor-pointer transition-all duration-300 relative
                    ${isSelected
                      ? 'bg-indigo-50/50'
                      : 'bg-white hover:bg-slate-50/50'
                    }
                  `}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full shadow-[0_0_12px_rgba(79,70,229,0.4)]" />
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`
                      h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
                      ${isSelected
                        ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200'
                        : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                      }
                    `}>
                      <Mic size={20} className={isSelected ? 'animate-pulse' : ''} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`
                          text-[15px] font-black truncate tracking-tight transition-colors
                          ${isSelected ? 'text-indigo-900' : 'text-slate-900'}
                        `}>
                          {log.caller_name || 'Anonymous Caller'}
                        </h3>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter shrink-0">
                          {formatLogDate(log.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getTypeBadge(log.category)}
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-tighter">
                          <Clock size={10} />
                          {formatDuration(log.duration_seconds || 0)}
                        </div>
                        {isUrgent && (
                          <>
                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg ring-1 ring-rose-500/20 text-[11px] font-black uppercase tracking-widest">
                              <Zap size={9} className="fill-rose-500" />
                              URGENT
                            </div>
                          </>
                        )}
                      </div>

                      <p className={`
                        text-[13px] font-medium line-clamp-2 leading-relaxed
                        ${isSelected ? 'text-indigo-700/70' : 'text-slate-500'}
                      `}>
                        {log.summary || log.transcript || 'No details available for this call'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogList;
