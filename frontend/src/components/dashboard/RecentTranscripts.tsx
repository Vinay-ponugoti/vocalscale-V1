import React from 'react';
import { Phone, Clock, MessageSquare, ChevronRight, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface Call {
  id: string | number;
  caller_name: string;
  created_at: string;
  category: string;
  transcript_snippet?: string;
  summary?: string;
  phone_number?: string;
  caller_phone?: string;
}

interface RecentTranscriptsProps {
  calls: Call[];
}

const RecentTranscripts: React.FC<RecentTranscriptsProps> = ({ calls }) => {
  const navigate = useNavigate();

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  const getCategoryStyles = (category: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-rose-50 text-rose-600 border-rose-100',
      inquiry: 'bg-blue-50 text-blue-600 border-blue-100',
      support: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      default: 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return styles[category.toLowerCase()] || styles.default;
  };

  const displayedCalls = [...calls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <MessageSquare size={15} />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Recent calls</h3>
        </div>
        <Link
          to="/dashboard/calls"
          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex-1">
        {calls.length === 0 ? (
          <EmptyState
            icon={Phone}
            title="No calls yet"
            description="Calls your agent answers will show here."
            className="py-10"
          />
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {displayedCalls.map((call) => (
              <div
                key={call.id}
                className="group relative px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/calls/${call.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {/* Avatar deep-links to the caller's contact card when we know the number */}
                    <button
                      title={call.phone_number || call.caller_phone ? 'View contact' : undefined}
                      onClick={(e) => {
                        const phone = call.phone_number || call.caller_phone;
                        if (!phone) return; // fall through to the row click
                        e.stopPropagation();
                        navigate(`/dashboard/contacts?phone=${encodeURIComponent(phone)}`);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {(call.caller_name || "U").charAt(0).toUpperCase()}
                      </span>
                    </button>
                    {call.category === 'urgent' && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                      <h4 className="min-w-0 truncate text-sm font-semibold text-slate-900">
                        {call.caller_name || "Unknown caller"}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`max-w-[92px] shrink-0 truncate rounded-md border-none px-2 py-0.5 text-[11px] font-semibold capitalize ${getCategoryStyles(call.category)}`}
                      >
                        {call.category}
                      </Badge>
                    </div>

                    <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(call.created_at)}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-700 transition-colors">
                      {call.summary || call.transcript_snippet || "Summary is being prepared…"}
                    </p>
                  </div>

                  <ChevronRight className="hidden h-4 w-4 shrink-0 self-center text-slate-300 transition group-hover:text-slate-500 sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTranscripts;
