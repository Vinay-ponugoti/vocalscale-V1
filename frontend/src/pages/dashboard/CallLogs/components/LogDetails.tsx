import React from 'react';
import { Share, Download, Check, FileText, Flag, Bot, Info, Mic, Clock } from 'lucide-react';
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

  const transcriptMessages = parseTranscript(log.transcript);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 w-full">

      {/* --- Header Area --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-indigo-500/10 shadow-sm">
            <Mic size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Call Intelligence</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {formattedDate} <span className="mx-1.5 text-slate-200">•</span> {formattedTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-100">
              <Share size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-100">
              <Download size={16} />
            </Button>
          </div>
          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 shadow-lg shadow-indigo-200 ring-1 ring-indigo-500/20">
            <Check size={14} className="mr-1.5" />
            Mark Resolved
          </Button>
        </div>
      </div>

      {/* --- AI Summary Section --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Bot size={14} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">AI Analysis</h3>
        </div>
        <AISummary summary={log.summary || log.notes} />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Transcript */}
        <div className="lg:col-span-8 space-y-6">

          {/* Transcript Container */}
          <Card className="border-slate-200 overflow-hidden flex flex-col shadow-sm ring-1 ring-slate-200/50">
            <CardHeader className="px-5 py-3 border-b border-slate-100 bg-slate-50/30 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Transcript</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border-emerald-100 uppercase tracking-tighter">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Recorded
              </Badge>
            </CardHeader>

            <CardContent className="p-6 space-y-6 bg-white min-h-[300px]">
              {transcriptMessages.length > 0 ? (
                transcriptMessages.map((msg) => {
                  const isAI = msg.role === 'assistant';

                  return (
                    <div key={msg.id} className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border text-[10px] font-black shadow-sm ring-1 ${isAI ? 'bg-indigo-600 border-indigo-500 text-white ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 ring-slate-900/5'
                        }`}>
                        {isAI ? <Bot size={14} /> : (log.caller_name || 'Unknown').substring(0, 1).toUpperCase()}
                      </div>
                      <div className={`space-y-1 max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                        <div className={`px-4 py-3 text-[13px] leading-relaxed transition-all font-medium ${isAI
                            ? 'bg-slate-50 text-slate-900 rounded-xl rounded-tl-none border border-slate-100'
                            : 'bg-white text-slate-900 rounded-xl rounded-tr-none border border-slate-200 shadow-sm'
                          }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 ring-1 ring-slate-100">
                    <FileText size={20} className="text-slate-200" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">No transcript data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Notes */}
          {log.notes && (
            <div className="bg-amber-50/40 border border-amber-100/60 rounded-xl p-5 flex gap-3 ring-1 ring-amber-500/10">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Info size={16} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-900 text-[9px] uppercase tracking-widest mb-1">System Note</h3>
                <p className="text-sm text-amber-800/80 leading-relaxed font-medium">{log.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Meta Info */}
        <div className="lg:col-span-4 space-y-6">

          {/* Caller Identity Card */}
          <Card className="bg-white rounded-xl border-slate-200 shadow-sm p-5 space-y-5 ring-1 ring-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg font-black text-slate-400 ring-1 ring-slate-900/5">
                {(log.caller_name || 'Unknown').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black text-slate-900 truncate tracking-tight">{log.caller_name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{log.phone_number}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 font-black text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-lg">
                {log.category}
              </Badge>
              {log.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-white text-slate-400 border-slate-100 font-bold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-lg">
                  #{tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Call Metadata */}
          <Card className="bg-white rounded-xl border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-200/50">
            <CardHeader className="px-5 py-3 border-b border-slate-100 bg-slate-50/30">
              <CardTitle className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" />
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
                    <span className="text-sm font-black text-indigo-600">{log.lead_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden ring-1 ring-slate-900/5">
                    <div
                      className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000"
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