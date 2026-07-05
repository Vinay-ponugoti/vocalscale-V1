import React from 'react';
import { Phone, Clock, FileText, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Call {
  id: string | number;
  caller_name: string;
  created_at: string;
  category: string;
  transcript_snippet?: string;
  summary?: string;
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
      inquiry: 'bg-blue-electric/10 text-blue-electric border-blue-electric/20',
      support: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      default: 'bg-white-light text-charcoal-light border-white-light'
    };
    return styles[category.toLowerCase()] || styles.default;
  };

  const displayedCalls = [...calls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <Card className="flex h-full min-w-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 rounded-xl bg-blue-electric/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-electric" />
            </div>
            <CardTitle className="min-w-0 truncate text-base font-black text-charcoal uppercase">Recent Activity</CardTitle>
          </div>
          <p className="truncate pl-10 text-[11px] font-bold text-charcoal-light uppercase tracking-widest">Latest customer interactions</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-[11px] font-black uppercase tracking-widest text-charcoal-light hover:text-blue-electric group"
          onClick={() => navigate('/dashboard/calls')}
        >
          View All
          <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {calls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-white-light">
              <Phone className="w-8 h-8 text-charcoal-light" />
            </div>
            <p className="text-sm font-black text-charcoal uppercase tracking-tight">No calls recorded</p>
            <p className="text-xs font-bold text-charcoal-light mt-1 uppercase tracking-widest leading-relaxed">
              Active transcripts will appear here<br />once interactions begin
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedCalls.map((call) => (
              <div
                key={call.id}
                className="group relative p-5 hover:bg-white-light/80 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/dashboard/calls/${call.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-sm font-black text-charcoal-medium">
                        {(call.caller_name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {call.category === 'urgent' && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                      <h4 className="min-w-0 truncate text-sm font-black text-charcoal">
                        {call.caller_name || "Unknown Caller"}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`max-w-[92px] shrink-0 truncate rounded-lg border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${getCategoryStyles(call.category)}`}
                      >
                        {call.category}
                      </Badge>
                    </div>

                    <div className="mb-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-charcoal-light uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {formatTime(call.created_at)}
                      </div>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-charcoal-light"></span>
                      <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <FileText className="w-3 h-3" />
                        <span className="truncate">Call Summary</span>
                      </div>
                    </div>

                    <p className="text-[12px] text-charcoal-light font-medium leading-relaxed line-clamp-2 group-hover:text-charcoal-medium transition-colors">
                      {call.summary || call.transcript_snippet || "Transcript is being prepared..."}
                    </p>
                  </div>

                  <div className="hidden shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 sm:block">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-blue-electric" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTranscripts;
