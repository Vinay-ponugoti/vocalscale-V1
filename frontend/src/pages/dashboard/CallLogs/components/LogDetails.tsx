import React from 'react';
import { Share, Download, FileText, Flag, Bot, Headset, Clock } from 'lucide-react';
import type { CallLog } from '../types';
import AISummary from './AISummary';
import { format, parseISO } from 'date-fns';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';

interface LogDetailsProps {
  log: CallLog;
}

const parseTranscript = (transcript?: string) => {
  if (!transcript) return [];

  const lines = transcript.split('\n');
  const messages: { role: string; rawRole: string; content: string; id: number }[] = [];
  let currentMessage: { role: string; rawRole: string; content: string; id: number } | null = null;

  lines.forEach((line, index) => {
    const colonIndex = line.indexOf(':');
    let isNewMessage = false;
    let potentialRole = '';

    if (colonIndex !== -1) {
      potentialRole = line.substring(0, colonIndex).trim().toLowerCase();
      if (['system', 'user', 'caller', 'assistant', 'ai'].includes(potentialRole)) {
        isNewMessage = true;
      }
    }

    if (isNewMessage) {
      let normalizedRole = 'unknown';
      if (potentialRole.includes('assistant') || potentialRole.includes('ai')) normalizedRole = 'assistant';
      else if (potentialRole.includes('user') || potentialRole.includes('caller')) normalizedRole = 'user';
      else if (potentialRole.includes('system')) normalizedRole = 'system';

      // Skip technical roles like 'tool' or 'error'
      if (['tool', 'error', 'debug', 'internal'].includes(potentialRole)) {
        currentMessage = null;
        return;
      }

      currentMessage = {
        role: normalizedRole,
        rawRole: potentialRole,
        content: line.substring(colonIndex + 1).trim(),
        id: index
      };
      messages.push(currentMessage);
    } else {
      // If it's not a new message, check if the line itself looks like technical output
      const technicalPatterns = [
        /^tool:/i,
        /^error:/i,
        /^{"error":/i,
        /^{"status":/i,
        /^debug:/i
      ];

      if (technicalPatterns.some(pattern => pattern.test(line.trim()))) {
        return; // Skip technical lines
      }

      if (currentMessage) {
        currentMessage.content += '\n' + line;
      } else {
        // Only create unknown message if it doesn't look like technical output
        currentMessage = { role: 'unknown', rawRole: 'unknown', content: line, id: index };
        messages.push(currentMessage);
      }
    }
  });

  return messages.filter(m => m.role === 'user' || m.role === 'assistant');
};

const LogDetails: React.FC<LogDetailsProps> = ({ log }) => {
  const formattedDate = format(parseISO(log.created_at), 'MMM dd, yyyy');
  const formattedTime = format(parseISO(log.created_at), 'h:mm a');

  const [visibleMessages, setVisibleMessages] = React.useState(20);
  const transcriptMessages = parseTranscript(log.transcript);
  
  const handleLoadMore = () => {
    setVisibleMessages(prev => prev + 20);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 w-full">

      {/* --- Header Area --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4285F4] to-[#3474E0] text-white rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-blue-500/10 shadow-xl shadow-blue-200/50 transition-all duration-500 hover:scale-105">
            <Headset size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Call Intelligence</h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              {formattedDate} <span className="mx-2 text-slate-300">•</span> {formattedTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <Share size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            <Download size={18} />
          </Button>
        </div>
      </div>

      {/* --- AI Summary Section --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bot size={16} className="text-[#4285F4]" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">AI Analysis</h3>
        </div>
        <AISummary summary={log.summary || log.notes} />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Transcript */}
        <div className="lg:col-span-8 space-y-6">

          {/* Transcript Container */}
          <Card className="border-slate-200 overflow-hidden flex flex-col shadow-md ring-1 ring-slate-900/5">
            <CardHeader className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-black text-slate-900 text-xs uppercase tracking-wider">Conversation Transcript</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border-emerald-200 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Recorded
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {transcriptMessages.length > 0 ? (
                <div className="flex flex-col">
                  <div className="flex flex-col divide-y divide-slate-100">
                    {transcriptMessages.slice(0, visibleMessages).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-6 transition-all duration-300 hover:bg-slate-50/50 ${msg.role === 'assistant' ? 'bg-slate-50/30' : 'bg-white'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ring-2 ring-white ${msg.role === 'assistant'
                            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700'
                            : 'bg-white text-slate-600 border-slate-200'
                            }`}>
                            {msg.role === 'assistant' ? <Bot size={14} /> : <span className="text-[10px] font-black">U</span>}
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'assistant' ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                {msg.role === 'assistant' ? 'AI Assistant' : 'Caller'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {visibleMessages < transcriptMessages.length && (
                    <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/30">
                      <Button 
                        variant="outline" 
                        onClick={handleLoadMore}
                        className="text-xs font-bold text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900 shadow-sm"
                      >
                        Load More Messages ({transcriptMessages.length - visibleMessages} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No transcript available for this call.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta Info */}
        <div className="lg:col-span-4 space-y-6">

          {/* Caller Identity Card */}
          <Card className="bg-white rounded-2xl border-slate-200 shadow-md p-6 space-y-5 ring-1 ring-slate-900/5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-200 flex items-center justify-center text-xl font-black text-slate-600 ring-4 ring-slate-900/5 shadow-sm">
                {(log.caller_name || 'Unknown').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-slate-900 truncate tracking-tight">{log.caller_name}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-1 truncate">{log.phone_number}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-slate-200 font-bold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-lg">
                {log.category}
              </Badge>
              {log.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-white text-slate-500 border-slate-200 font-semibold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-lg">
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Call Metadata */}
          <Card className="bg-white rounded-2xl border-slate-200 shadow-md overflow-hidden ring-1 ring-slate-900/5">
            <CardHeader className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="font-black text-slate-900 text-xs uppercase tracking-wider">Call Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  {Math.floor((log.duration_seconds || 0) / 60)}m {(log.duration_seconds || 0) % 60}s
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <Badge className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-none ${log.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50'
                  : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50'
                  }`}>{log.status}</Badge>
              </div>

              {log.lead_score && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Score</span>
                    <span className="text-sm font-black text-slate-900">{log.lead_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden ring-1 ring-slate-900/5">
                    <div
                      className="h-full bg-slate-900 rounded-full shadow-[0_0_10px_rgba(15,23,42,0.2)] transition-all duration-1000"
                      style={{ width: `${log.lead_score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {log.handled_by && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handled By</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 ring-1 ring-slate-900/5 shadow-sm">
                      {log.handled_by.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-black text-slate-900 tracking-tight">{log.handled_by}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow Up Requirement */}
          {log.follow_up_required && (
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 space-y-4 ring-1 ring-rose-500/10">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Flag size={14} className="fill-rose-700" />
                </div>
                <h4 className="font-black text-[10px] uppercase tracking-widest">Action Required</h4>
              </div>
              <p className="text-sm text-rose-600/80 leading-relaxed font-medium">
                This interaction has been flagged for manual follow-up and review.
              </p>
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl h-10 shadow-lg shadow-rose-200">
                Process Alert
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetails;