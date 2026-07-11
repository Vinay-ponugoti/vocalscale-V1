import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Flag, X } from 'lucide-react';

const DISMISSED_KEY = 'vs-attention-dismissed';

const loadDismissed = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

interface AttentionCall {
  id: number | string;
  created_at: string;
  is_urgent: boolean;
  follow_up_required?: boolean;
  caller_name: string;
  category: string;
  summary: string;
}

/**
 * The "do these things" panel — urgent and follow-up calls for the selected
 * period, each one click from its call detail. Hidden when there's nothing
 * to act on (an empty warning panel is just noise).
 */
const NeedsAttention = ({ calls }: { calls: AttentionCall[] }) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed);

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore quota/availability errors — dismissal just won't persist */
      }
      return next;
    });
  };

  const visible = calls.filter((c) => !dismissed.has(String(c.id)));
  if (visible.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <AlertTriangle size={15} />
        </span>
        <h3 className="text-sm font-semibold text-amber-900">
          Needs attention
          <span className="ml-1.5 rounded-full bg-amber-200/70 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
            {visible.length}
          </span>
        </h3>
      </div>

      <ul className="space-y-1.5">
        {visible.map((c) => (
          <li key={c.id} className="group flex items-center gap-1">
            <button
              onClick={() => navigate(`/dashboard/calls/${c.id}`)}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2.5 text-left transition hover:bg-white"
            >
              <span className="shrink-0">
                {c.is_urgent ? (
                  <AlertTriangle size={14} className="text-rose-500" />
                ) : (
                  <Flag size={14} className="text-amber-500" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">
                  {c.caller_name || 'Unknown caller'}
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    {c.is_urgent ? 'urgent' : 'follow-up'}
                  </span>
                </span>
                {c.summary && <span className="block truncate text-xs text-slate-500">{c.summary}</span>}
              </span>
              <ChevronRight size={14} className="shrink-0 text-slate-300 transition group-hover:text-slate-500" />
            </button>
            <button
              onClick={() => dismiss(String(c.id))}
              aria-label="Dismiss"
              title="Dismiss"
              className="shrink-0 rounded-lg p-1.5 text-amber-400 transition hover:bg-amber-100 hover:text-amber-700"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NeedsAttention;
