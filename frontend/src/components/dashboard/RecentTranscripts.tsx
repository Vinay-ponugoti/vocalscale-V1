import React from 'react';
import { Phone, Clock, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
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
    <Card className="border-white-light shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white-light">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-electric/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-electric" />
            </div>
            <CardTitle className="text-base font-black text-charcoal tracking-tight uppercase">Recent Activity</CardTitle>
          </div>
          <p className="text-[11px] font-bold text-charcoal-light uppercase tracking-widest pl-10">Latest customer interactions</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] font-black uppercase tracking-widest text-charcoal-light hover:text-blue-electric group"
          onClick={() => navigate('/dashboard/calls')}
        >
          View All
          <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {calls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-white-light rounded-2xl flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-charcoal-light" />
            </div>
            <p className="text-sm font-black text-charcoal uppercase tracking-tight">No calls recorded</p>
            <p className="text-xs font-bold text-charcoal-light mt-1 uppercase tracking-widest leading-relaxed">
              Active transcripts will appear here<br />once interactions begin
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white-light">
            {displayedCalls.map((call) => (
              <div
                key={call.id}
                className="group relative p-5 hover:bg-white-light/80 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/dashboard/calls/${call.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white-light to-white-soft flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-charcoal truncate tracking-tight">
                        {call.caller_name || "Unknown Caller"}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5 rounded-lg ${getCategoryStyles(call.category)}`}
                      >
                        {call.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal-light uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {formatTime(call.created_at)}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-charcoal-light"></span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-electric uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        AI Summarized
                      </div>
                    </div>

                    <p className="text-[12px] text-charcoal-light font-medium leading-relaxed line-clamp-2 group-hover:text-charcoal-medium transition-colors">
                      {call.summary || call.transcript_snippet || "AI is processing this call transcript..."}
                    </p>
                  </div>

                  <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-white-light flex items-center justify-center">
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