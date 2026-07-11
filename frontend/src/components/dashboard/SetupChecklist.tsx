import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, X, Rocket, ChevronRight } from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';
import { agentsAPI } from '../../api/agents';
import { businessSetupAPI } from '../../api/businessSetup';
import { cn } from '../../lib/utils';

const DISMISS_KEY = 'vs-setup-checklist-dismissed';

const fetchJSON = async <T,>(path: string): Promise<T> => {
  const headers = await getAuthHeader();
  const res = await fetch(`${env.API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

interface Step {
  key: string;
  label: string;
  hint: string;
  to: string;
  done: boolean;
}

/**
 * First-run activation checklist. Renders only while setup is incomplete
 * (or until dismissed) — established accounts never see it.
 */
const SetupChecklist = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  const { data: numbers } = useQuery({
    queryKey: ['setup', 'phone-numbers'],
    queryFn: async () => {
      const res = await fetchJSON<{ data?: unknown[] } | unknown[]>('/phone-numbers');
      return Array.isArray(res) ? res : res.data || [];
    },
    staleTime: 300_000,
    retry: 1,
  });

  const { data: agents } = useQuery({
    queryKey: ['setup', 'agents'],
    queryFn: () => agentsAPI.listAgents(),
    staleTime: 300_000,
    retry: 1,
  });

  const { data: knowledgeFiles } = useQuery({
    queryKey: ['setup', 'knowledge'],
    queryFn: () => businessSetupAPI.getKnowledgeFiles(),
    staleTime: 300_000,
    retry: 1,
  });

  const { data: firstCall } = useQuery({
    queryKey: ['setup', 'first-call'],
    queryFn: () => fetchJSON<{ calls?: unknown[]; data?: unknown[] }>('/dashboard/calls?page=1&size=1'),
    staleTime: 300_000,
    retry: 1,
  });

  if (dismissed) return null;
  // Wait until every signal has answered — a checklist built on half-loaded
  // data flashes wrong states.
  if (!numbers || !agents || !knowledgeFiles || !firstCall) return null;

  const callsArr = firstCall.calls ?? firstCall.data ?? [];
  const steps: Step[] = [
    {
      key: 'number',
      label: 'Get a phone number',
      hint: 'Your AI answers on this line',
      to: '/dashboard/voice-setup',
      done: numbers.length > 0,
    },
    {
      key: 'agent',
      label: 'Configure your agent',
      hint: 'Name, voice, and greeting',
      to: '/dashboard/agents',
      done: (agents ?? []).some((a) => a.is_active),
    },
    {
      key: 'knowledge',
      label: 'Upload business knowledge',
      hint: 'Menu, FAQs, hours, policies',
      to: '/dashboard/knowledge',
      done: knowledgeFiles.length > 0,
    },
    {
      key: 'call',
      label: 'Take your first call',
      hint: 'Test it or share your number',
      to: '/dashboard/agents',
      done: Array.isArray(callsArr) && callsArr.length > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Rocket size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Finish setting up your AI receptionist</h3>
            <p className="text-xs text-slate-500">
              {doneCount} of {steps.length} done — a few minutes to go live
            </p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Dismiss checklist"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-blue-100/70">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s) => (
          <Link
            key={s.key}
            to={s.to}
            className={cn(
              'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition',
              s.done
                ? 'border-transparent bg-white/60 opacity-70'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm',
            )}
          >
            {s.done ? (
              <CheckCircle2 size={17} className="shrink-0 text-emerald-500" />
            ) : (
              <Circle size={17} className="shrink-0 text-slate-300" />
            )}
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate text-sm font-medium', s.done ? 'text-slate-400 line-through' : 'text-slate-800')}>
                {s.label}
              </span>
              <span className="block truncate text-[11px] text-slate-400">{s.hint}</span>
            </span>
            {!s.done && <ChevronRight size={14} className="shrink-0 text-slate-300 group-hover:text-blue-500" />}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SetupChecklist;
