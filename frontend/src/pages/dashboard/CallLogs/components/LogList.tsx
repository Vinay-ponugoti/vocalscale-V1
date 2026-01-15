import React, { useState } from 'react';
import {
  Clock, ChevronLeft, ChevronRight, Zap, Mic, Search, PhoneIncoming
} from 'lucide-react';
import type { CallLog } from '../types';
import { isToday, isYesterday, parseISO } from 'date-fns';
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
    const baseStyle = "shadow-none font-black text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-lg border transition-all duration-300";
    switch (type) {
      case 'Booking':
        return <Badge variant="default" className={`${baseStyle} bg-indigo-50 text-indigo-700 border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600`}>Booking</Badge>;
      case 'Inquiry':
        return <Badge variant="default" className={`${baseStyle} bg-purple-50 text-purple-700 border-purple-100/50 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600`}>Inquiry</Badge>;
      case 'Urgent':
        return <Badge variant="destructive" className={`${baseStyle} bg-rose-50 text-rose-700 border-rose-100/50 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 animate-pulse`}>Urgent</Badge>;
      default:
        return <Badge variant="secondary" className={`${baseStyle} bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900`}>{type || 'General'}</Badge>;
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
      <div className="flex-1 flex flex-col p-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-50/50 rounded-3xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Modern Header */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Activity</h2>
          <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-[10px] font-black text-white shadow-xl shadow-slate-200">
            {logs.length}
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[10px] font-black text-slate-900">{currentPage}</span>
            <span className="text-[10px] font-black text-slate-300">/</span>
            <span className="text-[10px] font-black text-slate-400">{totalPages || 1}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100 group">
              <Search className="text-slate-200 group-hover:scale-110 transition-transform" size={40} />
            </div>
            <h3 className="text-slate-900 font-black text-base uppercase tracking-tight">Zero Matches</h3>
            <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">No call records found for the current filter set.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentLogs.map((log) => {
              const isSelected = selectedId === log.id;
              const isUrgent = log.is_urgent || log.status?.includes('Action');

              return (
                <div
                  key={log.id}
                  onClick={() => onSelect(log.id)}
                  className={`
                    group p-5 cursor-pointer transition-all duration-500 rounded-3xl relative overflow-hidden
                    ${isSelected
                      ? 'bg-slate-900 shadow-2xl shadow-slate-400/20 translate-x-1 border-transparent'
                      : 'bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200'
                    }
                  `}
                >
                  {/* Glass Gloss Effect for Selection */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12">
                      <Mic size={100} className="text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`
                      h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
                      ${isSelected
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                        : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-50 group-hover:ring-1 group-hover:ring-indigo-100'
                      }
                    `}>
                      {isUrgent ? <Zap size={22} className={isSelected ? 'fill-white' : ''} /> : <PhoneIncoming size={22} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`
                          text-base font-black truncate tracking-tight transition-colors duration-500
                          ${isSelected ? 'text-white' : 'text-slate-900'}
                        `}>
                          {log.caller_name || 'Restricted Number'}
                        </h3>
                        <span className={`
                          text-[10px] font-black uppercase tracking-tighter shrink-0
                          ${isSelected ? 'text-slate-400' : 'text-slate-400'}
                        `}>
                          {formatLogDate(log.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {getTypeBadge(log.category)}
                        <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-slate-600' : 'bg-slate-200'}`} />
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                          <Clock size={11} className="shrink-0" />
                          {formatDuration(log.duration_seconds || 0)}
                        </div>
                      </div>

                      <p className={`
                        text-xs font-medium line-clamp-1 leading-relaxed transition-colors duration-500
                        ${isSelected ? 'text-slate-400' : 'text-slate-500'}
                      `}>
                        {log.summary || log.transcript || 'AI analysis in progress...'}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Bar */}
                  {isUrgent && !isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
    </div>
  );
};

export default LogList;
