import React from 'react';
import { AlertTriangle, Bot, CheckCircle2, Clock, FileText, Flag, Phone, PhoneMissed, Share } from 'lucide-react';
import type { CallLog } from '../types';
import { format, parseISO } from 'date-fns';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';

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
      const technicalPatterns = [
        /^tool:/i,
        /^error:/i,
        /^{"error":/i,
        /^{"status":/i,
        /^debug:/i
      ];

      if (technicalPatterns.some(pattern => pattern.test(line.trim()))) {
        return;
      }

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
  const duration = log.duration_seconds || 0;
  const durationLabel = `${Math.floor(duration / 60)}m ${duration % 60}s`;
  const normalizedStatus = (log.status || '').toLowerCase();
  const isMissed = normalizedStatus.includes('missed') || normalizedStatus.includes('failed') || normalizedStatus.includes('no answer');
  const isCompleted = normalizedStatus.includes('completed') || normalizedStatus.includes('handled');
  const isUrgent = log.follow_up_required || log.is_urgent || log.status?.includes('Action');

  const statusMeta = isMissed
    ? {
      icon: PhoneMissed,
      label: log.status || 'Missed',
      className: 'bg-rose-50 text-rose-700 border-rose-100'
    }
    : isCompleted
      ? {
        icon: CheckCircle2,
        label: log.status || 'Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100'
      }
      : {
        icon: AlertTriangle,
        label: log.status || 'Open',
        className: 'bg-amber-50 text-amber-700 border-amber-100'
      };
  const StatusIcon = statusMeta.icon;

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const transcriptMessages = parseTranscript(log.transcript);
  const totalPages = Math.ceil(transcriptMessages.length / itemsPerPage);

  const currentMessages = transcriptMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const [shareLabel, setShareLabel] = React.useState<string | null>(null);

  const buildCallText = () => {
    const lines = [
      `Call with ${log.caller_name || 'Unknown Caller'}`,
      `Phone: ${log.phone_number || 'N/A'}`,
      `Date: ${formattedDate} ${formattedTime}`,
      `Status: ${statusMeta.label}`,
      `Type: ${log.category || 'General'}`,
      `Duration: ${durationLabel}`,
      log.lead_score ? `Lead score: ${log.lead_score}%` : null,
      '',
      'Summary:',
      log.summary || 'No summary available.',
      '',
      'Transcript:',
      log.transcript || 'No transcript available.'
    ].filter((line): line is string => line !== null);

    return lines.join('\n');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const title = `Call with ${log.caller_name || 'Unknown Caller'}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: buildCallText(), url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareLabel('Link copied');
      window.setTimeout(() => setShareLabel(null), 2000);
    } catch (err) {
      // Ignore user-cancelled share dialogs; surface copy failures.
      if ((err as Error)?.name !== 'AbortError') {
        setShareLabel('Share failed');
        window.setTimeout(() => setShareLabel(null), 2000);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col animate-in fade-in duration-300">
      <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-black text-slate-700 sm:h-10 sm:w-10">
              {(log.caller_name || 'U').substring(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="max-w-full truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                  {log.caller_name || 'Unknown Caller'}
                </h1>
                <Badge variant="outline" className={`gap-1 border text-xs font-semibold shadow-none ${statusMeta.className}`}>
                  <StatusIcon size={13} />
                  {statusMeta.label}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500 sm:gap-x-4">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Phone size={14} />
                  <span className="truncate">{log.phone_number || 'No phone number'}</span>
                </span>
                <span>{formattedDate}</span>
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:shrink-0 sm:items-center">
            <Button variant="outline" size="sm" onClick={handleShare} className="h-9 rounded-lg text-xs font-semibold sm:h-8">
              <Share size={15} className="mr-2" />
              {shareLabel || 'Share'}
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs font-semibold text-slate-500">Duration</p>
            <p className="mt-0.5 text-base font-black text-slate-950">{durationLabel}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs font-semibold text-slate-500">Type</p>
            <p className="mt-0.5 truncate text-base font-black text-slate-950">{log.category || 'General'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs font-semibold text-slate-500">Lead score</p>
            <p className="mt-0.5 text-base font-black text-slate-950">{log.lead_score ? `${log.lead_score}%` : 'Not set'}</p>
          </div>
          <div className={`rounded-lg border p-2.5 ${isUrgent ? 'border-rose-100 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>Next action</p>
            <p className={`mt-0.5 truncate text-base font-black ${isUrgent ? 'text-rose-700' : 'text-slate-950'}`}>
              {isUrgent ? 'Follow up' : 'No action'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 md:max-h-[720px] md:min-h-[520px]">
            <div className="flex shrink-0 flex-row items-center justify-between border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
              <h2 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">Transcript</h2>
              <Badge variant="outline" className="gap-1.5 rounded-lg border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Recorded
              </Badge>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between bg-white p-3 sm:p-4">
              {currentMessages.length > 0 ? (
                <>
                  <div className="scrollbar-hide min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                    {currentMessages.map((msg) => {
                      const isAI = msg.role === 'assistant';

                      return (
                        <div key={msg.id} className={`flex gap-2.5 sm:gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black sm:h-8 sm:w-8 ${isAI
                            ? 'border-cyan-100 bg-cyan-50 text-cyan-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}>
                            {isAI ? <Bot size={14} /> : (log.caller_name || 'Unknown').substring(0, 1).toUpperCase()}
                          </div>
                          <div className={`max-w-[88%] space-y-1 sm:max-w-[86%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                            <div className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] font-medium leading-5 sm:text-sm ${isAI
                              ? 'rounded-tl-none border border-slate-200 bg-slate-50 text-slate-950'
                              : 'rounded-tr-none border border-cyan-100 bg-cyan-50/60 text-slate-950'
                              }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs font-semibold text-slate-500">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="h-9 text-xs font-semibold"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="h-9 text-xs font-semibold"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center text-slate-500">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                    <FileText size={20} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold">No transcript data available</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-3 xl:col-span-4">
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-base font-black text-slate-700">
                {(log.caller_name || 'Unknown').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-black tracking-tight text-slate-950">{log.caller_name || 'Unknown Caller'}</h2>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">{log.phone_number || 'No phone number'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary" className="rounded-lg border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-950">
                {log.category || 'General'}
              </Badge>
              {log.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="rounded-lg border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                  #{tag}
                </Badge>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <h2 className="text-base font-black tracking-tight text-slate-950">Call details</h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Duration</span>
                <span className="flex items-center gap-2 text-sm font-black text-slate-950">
                  <Clock size={14} className="text-slate-400" />
                  {durationLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Status</span>
                <Badge className={`rounded-lg border px-2.5 py-1 text-xs font-bold shadow-none ${statusMeta.className}`}>
                  {statusMeta.label}
                </Badge>
              </div>

              {log.lead_score && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Lead score</span>
                    <span className="text-sm font-black text-slate-950">{log.lead_score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-cyan-600 transition-all duration-1000"
                      style={{ width: `${log.lead_score}%` }}
                    />
                  </div>
                </div>
              )}

              {log.handled_by && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-slate-500">Handled by</span>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-black text-slate-600">
                      {log.handled_by.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sm font-black tracking-tight text-slate-950">{log.handled_by}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {isUrgent && (
            <div className="space-y-3 overflow-hidden rounded-lg border border-rose-100 bg-rose-50 p-4">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                  <Flag size={14} />
                </div>
                <h4 className="text-sm font-semibold">Action required</h4>
              </div>
              <p className="line-clamp-2 text-sm font-medium leading-5 text-rose-700/80">
                This call is flagged for manual follow-up. Keep it visible near the customer context so the next step is not missed.
              </p>
              <Button className="h-10 w-full rounded-lg bg-rose-600 text-sm font-semibold text-white shadow-none hover:bg-rose-700">
                Mark follow-up handled
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetails;
