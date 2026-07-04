import React from 'react';
import {
  Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Flame, PhoneCall, PhoneMissed, PhoneOutgoing, Search
} from 'lucide-react';
import type { CallLog } from '../types';
import { parseISO, isToday, isYesterday } from 'date-fns';
import { toZonedTime, format as formatTZ } from 'date-fns-tz';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useBusinessSetup } from '../../../../context/BusinessSetupContext';

interface LogListProps {
  logs: CallLog[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPrefetch?: (id: string) => void;
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const getLeadBadge = (score?: number) => {
  if (score === undefined || score === null) return null;
  const meta = score >= 70
    ? { label: `Hot ${score}`, className: 'bg-orange-50 text-orange-700 ring-orange-200' }
    : score >= 40
      ? { label: `Warm ${score}`, className: 'bg-amber-50 text-amber-700 ring-amber-200' }
      : { label: `Cold ${score}`, className: 'bg-slate-50 text-slate-500 ring-slate-200' };
  return (
    <div className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ${meta.className}`}>
      <Flame size={10} />
      {meta.label}
    </div>
  );
};

const LogList: React.FC<LogListProps> = ({
  logs,
  selectedId,
  onSelect,
  onPrefetch,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}) => {
  const { state } = useBusinessSetup();
  const timezone = state.data.business.timezone || 'America/New_York';

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
        return <Badge variant="default" className="border-cyan-100 bg-cyan-50 text-cyan-700 shadow-none hover:bg-cyan-50 text-[11px] font-semibold">Booking</Badge>;
      case 'Inquiry':
        return <Badge variant="default" className="border-slate-200 bg-slate-50 text-slate-700 shadow-none hover:bg-slate-50 text-[11px] font-semibold">Inquiry</Badge>;
      case 'Urgent':
        return <Badge variant="destructive" className="border-rose-100 bg-rose-50 text-rose-700 shadow-none hover:bg-rose-50 text-[11px] font-semibold">Urgent</Badge>;
      default:
        return <Badge variant="secondary" className="border-slate-200 bg-slate-50 text-slate-600 shadow-none hover:bg-slate-50 text-[11px] font-semibold">{type || 'General'}</Badge>;
    }
  };

  const getStatusMeta = (status?: string) => {
    const normalized = (status || '').toLowerCase();

    if (normalized.includes('missed') || normalized.includes('failed') || normalized.includes('no answer')) {
      return {
        label: status || 'Missed',
        icon: PhoneMissed,
        className: 'bg-rose-50 text-rose-700 border-rose-100'
      };
    }

    if (normalized.includes('completed') || normalized.includes('handled')) {
      return {
        label: status || 'Completed',
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      };
    }

    return {
      label: status || 'Open',
      icon: PhoneCall,
      className: 'bg-amber-50 text-amber-700 border-amber-100'
    };
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col gap-2 overflow-hidden p-3 md:flex-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col bg-white md:h-full">
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-5 text-slate-950">Recent calls</h2>
          <span className="block text-xs font-medium leading-4 text-slate-500">
            {totalItems}
            {' '}
            calls shown
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="w-11 text-center text-xs font-semibold text-slate-500">
            {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain">
        {logs.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center md:h-full">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <Search className="text-slate-300" size={26} />
            </div>
            <h3 className="text-sm font-semibold text-slate-950">No calls found</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Try a wider date range or reset filters.</p>
          </div>
        ) : (
          <div className="space-y-2 p-3 md:space-y-0 md:divide-y md:divide-slate-100 md:p-0">
            {logs.map((log) => {
              const isSelected = selectedId === log.id;
              const isUrgent = log.is_urgent || log.status?.includes('Action');
              const isOutbound = log.direction === 'outbound';
              const statusMeta = getStatusMeta(log.status);
              const StatusIcon = statusMeta.icon;

              return (
                <div
                  key={log.id}
                  onClick={() => onSelect(log.id)}
                  onMouseEnter={() => onPrefetch?.(log.id)}
                  onFocus={() => onPrefetch?.(log.id)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(log.id);
                    }
                  }}
                  className={`
                    group relative cursor-pointer rounded-lg border border-slate-200 px-3 py-3 shadow-sm shadow-slate-200/50 transition-colors md:rounded-none md:border-0 md:px-4 md:shadow-none
                    ${isSelected
                      ? 'bg-cyan-50/70 ring-1 ring-cyan-100 md:ring-0'
                      : 'bg-white hover:bg-slate-50'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute bottom-3 left-0 top-3 hidden w-1 rounded-r-full bg-cyan-600 md:block" />
                  )}

                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className={`
                      flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-9 sm:w-9
                      ${isOutbound
                        ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                        : isSelected
                          ? 'border-cyan-100 bg-white text-cyan-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-cyan-100 group-hover:bg-cyan-50 group-hover:text-cyan-700'
                      }
                    `}>
                      {isOutbound ? <PhoneOutgoing size={18} /> : <PhoneCall size={18} />}
                    </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                        <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight text-slate-950">
                          {log.caller_name || 'Anonymous Caller'}
                        </h3>
                        <span className="shrink-0 text-xs font-semibold text-slate-500">
                          {formatLogDate(log.created_at)}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        {isOutbound && (
                          <Badge variant="outline" className="gap-1 border-indigo-100 bg-indigo-50 text-[11px] font-semibold text-indigo-700 shadow-none">
                            <PhoneOutgoing size={11} />
                            Outbound
                          </Badge>
                        )}
                        {getTypeBadge(log.category)}
                        <Badge variant="outline" className={`gap-1 border text-[11px] font-semibold shadow-none ${statusMeta.className}`}>
                          <StatusIcon size={11} />
                          {statusMeta.label}
                        </Badge>
                        <div className="flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                          <Clock size={10} />
                          {formatDuration(log.duration_seconds || 0)}
                        </div>
                        {getLeadBadge(log.lead_score)}
                        {isUrgent && (
                          <div className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100">
                            <AlertTriangle size={10} />
                            Follow-up
                          </div>
                        )}
                      </div>

                      <p className="line-clamp-2 text-[13px] font-medium leading-5 text-slate-600 md:line-clamp-1">
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
