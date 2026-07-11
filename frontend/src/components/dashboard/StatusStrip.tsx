import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bot, Phone, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { env } from '../../config/env';
import { getAuthHeader } from '../../lib/api';
import { agentsAPI } from '../../api/agents';
import { cn } from '../../lib/utils';

interface UsageInfo {
  minutes_used: number;
  minutes_limit: number;
  usage_percent: number;
}

interface PhoneNumberRow {
  id: string;
  phone_number: string;
  friendly_name?: string;
  status?: string;
}

const fetchJSON = async <T,>(path: string): Promise<T> => {
  const headers = await getAuthHeader();
  const res = await fetch(`${env.API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const formatPhone = (raw?: string) => {
  if (!raw) return '';
  const m = raw.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1 (${m[1]}) ${m[2]}-${m[3]}` : raw;
};

/**
 * One-line answer to "is my AI answering right now?" — phone number status,
 * active agent, and the plan-minutes meter. Sits directly under the header.
 */
const StatusStrip = () => {
  const { data: numbers } = useQuery({
    queryKey: ['status-strip', 'phone-numbers'],
    queryFn: async () => {
      const res = await fetchJSON<{ data?: PhoneNumberRow[] } | PhoneNumberRow[]>('/phone-numbers');
      return Array.isArray(res) ? res : res.data || [];
    },
    staleTime: 120_000,
    retry: 1,
  });

  const { data: agents } = useQuery({
    queryKey: ['status-strip', 'agents'],
    queryFn: () => agentsAPI.listAgents(),
    staleTime: 120_000,
    retry: 1,
  });

  const { data: usage } = useQuery({
    queryKey: ['status-strip', 'usage'],
    queryFn: () => fetchJSON<UsageInfo>('/billing/usage'),
    staleTime: 120_000,
    retry: 1,
  });

  // Until the basics load, render nothing — the strip appears once it can be truthful.
  if (!numbers && !agents) return null;

  const activeNumber = numbers?.find((n) => (n.status || '').toLowerCase() === 'active') ?? numbers?.[0];
  const numberActive = !!activeNumber && (activeNumber.status || 'active').toLowerCase() === 'active';
  const activeAgent = agents?.find((a) => a.is_active && a.is_default) ?? agents?.find((a) => a.is_active);
  const live = numberActive && !!activeAgent;

  const used = usage?.minutes_used ?? 0;
  const limit = usage?.minutes_limit ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const nearLimit = limit > 0 && pct >= 80;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      {/* Live indicator */}
      <span className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
          <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', live ? 'bg-emerald-500' : 'bg-amber-400')} />
        </span>
        <span className={cn('text-sm font-semibold', live ? 'text-emerald-700' : 'text-amber-600')}>
          {live ? 'Live' : 'Needs setup'}
        </span>
      </span>

      {/* Number */}
      {activeNumber ? (
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Phone size={14} className="text-slate-400" />
          {formatPhone(activeNumber.phone_number)}
        </span>
      ) : (
        <Link to="/dashboard/voice-setup" className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
          <AlertTriangle size={14} /> No phone number — set one up
        </Link>
      )}

      {/* Agent */}
      {activeAgent ? (
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Bot size={14} className="text-slate-400" />
          {activeAgent.name} <span className="text-slate-400">active</span>
        </span>
      ) : agents && agents.length === 0 ? (
        <Link to="/dashboard/agents" className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
          <AlertTriangle size={14} /> No active agent
        </Link>
      ) : null}

      {/* Minutes meter */}
      {usage && limit > 0 && (
        <span className="ml-auto flex items-center gap-3">
          <span className="hidden w-28 sm:block">
            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className={cn('block h-full rounded-full transition-all', nearLimit ? 'bg-amber-500' : 'bg-blue-600')}
                style={{ width: `${pct}%` }}
              />
            </span>
          </span>
          <span className={cn('text-xs font-medium tabular-nums', nearLimit ? 'text-amber-600' : 'text-slate-500')}>
            {Math.round(used)}/{limit} min
          </span>
          {nearLimit && (
            <Link
              to="/dashboard/billing/plans"
              className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Upgrade <ArrowUpRight size={12} />
            </Link>
          )}
        </span>
      )}
    </div>
  );
};

export default StatusStrip;
