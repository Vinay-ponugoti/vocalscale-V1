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
      inquiry: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      support: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      default: 'bg-slate-50 text-slate-600 border-slate-100'
    };
    return styles[category.toLowerCase()] || styles.default;
  };

  const displayedCalls = [...calls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <Card className="border-slate-100 shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-slate-600" />
            </div>
            <CardTitle className="text-base font-black text-slate-900 tracking-tight uppercase">Recent Activity</CardTitle>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-10">Latest customer interactions</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 group"
          onClick={() => navigate('/dashboard/calls')}
        >
          View All
          <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {calls.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">No calls recorded</p>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest leading-relaxed">
              Active transcripts will appear here<br />once interactions begin
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {displayedCalls.map((call) => (
              <div
                key={call.id}
                className="group relative p-5 hover:bg-slate-50/80 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/dashboard/calls/${call.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                      <span className="text-sm font-black text-slate-600">
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
                      <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">
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
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {formatTime(call.created_at)}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        AI Summarized
                      </div>
                    </div>

                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed line-clamp-1 group-hover:text-slate-700 transition-colors">
                      {call.summary || call.transcript_snippet || "AI is processing this call transcript..."}
                    </p>
                  </div>

                  <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-indigo-600" />
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