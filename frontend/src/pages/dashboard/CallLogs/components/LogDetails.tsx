import React from 'react';
import { Share, Download, Check, FileText, Flag, Bot, Info, Mic, Clock, User, Phone } from 'lucide-react';
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
      const technicalPatterns = [/^tool:/i, /^error:/i, /^{"error":/i, /^{"status":/i, /^debug:/i];
      if (technicalPatterns.some(pattern => pattern.test(line.trim()))) return;

      if (currentMessage) {
        currentMessage.content += '\n' + line;
      } else {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 w-full">

      {/* --- Premium Header Area --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl shadow-slate-200 ring-4 ring-slate-50 transition-transform hover:scale-105">
            <Mic size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Call Intel</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] bg-slate-50 px-2 py-1 rounded-md">
                {formattedDate}
              </p>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] bg-slate-50 px-2 py-1 rounded-md">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all">
              <Share size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all">
              <Download size={18} />
            </Button>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 h-11 rounded-2xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50 transition-all active:scale-95">
            <Check size={16} className="mr-2" />
            Resolve
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Intelligence hub */}
        <div className="lg:col-span-8 space-y-8">

          {/* AI Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Bot size={16} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">Executive Summary</h3>
            </div>
            <AISummary summary={log.summary || log.notes} />
          </div>

          {/* Transcript Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                  <FileText size={16} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900">Conversation Stream</h3>
              </div>
              <Badge variant="outline" className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border-emerald-100/50 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Transcript
              </Badge>
            </div>

            <Card className="border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40 rounded-[2rem] ring-1 ring-slate-100/50">
              <CardContent className="p-4 md:p-8 space-y-8 bg-white min-h-[400px]">
                {transcriptMessages.length > 0 ? (
                  <div className="space-y-6">
                    {transcriptMessages.map((msg) => {
                      const isAI = msg.role === 'assistant';

                      return (
                        <div key={msg.id} className={`flex gap-4 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}>
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border text-[11px] font-black shadow-lg transition-transform hover:scale-110 ${isAI ? 'bg-slate-900 border-slate-800 text-white shadow-slate-200' : 'bg-white border-slate-100 text-slate-400 shadow-slate-50'
                            }`}>
                            {isAI ? <Bot size={18} /> : <User size={18} />}
                          </div>
                          <div className={`space-y-2 max-w-[82%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block px-1">
                              {isAI ? 'VocalScale AI' : (log.caller_name || 'Customer')}
                            </span>
                            <div className={`px-5 py-4 text-[13px] leading-relaxed transition-all font-medium shadow-sm ${isAI
                                ? 'bg-slate-50 text-slate-800 rounded-[1.5rem] rounded-tl-none border border-slate-100'
                                : 'bg-indigo-600 text-white rounded-[1.5rem] rounded-tr-none border border-indigo-500'
                              }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-24 px-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                      <FileText size={40} className="text-slate-200" />
                    </div>
                    <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight">Stream Unavailable</h4>
                    <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[180px] leading-relaxed">No transcription records found for this interaction.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Insights */}
          {log.notes && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-6 flex gap-5 ring-4 ring-amber-50 transition-all hover:ring-amber-100/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/50">
                <Info size={22} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-900 text-[10px] uppercase tracking-widest mb-1.5 px-0.5">System Alert</h3>
                <p className="text-sm text-amber-800/90 leading-relaxed font-medium">{log.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Identity */}
        <div className="lg:col-span-4 space-y-8">

          {/* Identity Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-6 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-125 transition-transform duration-1000">
              <User size={120} />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-slate-200 ring-4 ring-slate-50">
                {(log.caller_name || 'U').substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-900 truncate tracking-tight">{log.caller_name || 'Anonymous'}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <Phone size={10} className="text-indigo-400" />
                  {log.phone_number || 'HIDDEN_ID'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 relative z-10">
              <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-lg">
                {log.category}
              </Badge>
              {log.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-white text-slate-400 border-slate-100 font-bold text-[9px] tracking-widest uppercase px-3 py-1 rounded-lg">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/20">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Call Metrics</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In-Call Duration</span>
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                  <Clock size={12} className="text-indigo-600" />
                  <span className="text-xs font-black text-indigo-700 tracking-tight">
                    {Math.floor((log.duration_seconds || 0) / 60)}m {(log.duration_seconds || 0) % 60}s
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
                <Badge className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-none ${log.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                    : 'bg-amber-50 text-amber-700 border-amber-100/50'
                  }`}>{log.status}</Badge>
              </div>

              {log.lead_score && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intent Score</span>
                    <span className="text-sm font-black text-indigo-600">{log.lead_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                    <div
                      className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all duration-1000"
                      style={{ width: `${log.lead_score}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Urgent Flag */}
          {log.follow_up_required && (
            <div className="bg-rose-600 rounded-[2rem] p-6 space-y-5 shadow-2xl shadow-rose-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:scale-125 transition-transform duration-1000">
                <Flag size={100} className="text-white" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Flag size={16} className="fill-white text-white" />
                </div>
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-white">Manual Review Required</h4>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed font-bold relative z-10">
                Our AI has flagged this conversation for human intervention. Please review the intent carefully.
              </p>
              <Button className="w-full bg-white text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl h-12 shadow-xl border-none relative z-10 transition-all active:scale-95">
                Initiate Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetails;