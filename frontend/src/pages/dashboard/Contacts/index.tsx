import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Users,
  RefreshCw,
  ChevronRight,
  UserPlus,
  Megaphone,
  UserRoundPlus,
  Clock3,
  Siren,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { contactsAPI, type Contact } from '../../../api/contacts';
import { AddContactModal } from './AddContactModal';
import { avatarColor, displayName, formatPhone, initials, relativeDate } from './utils';

type SmartView = 'all' | 'new' | 'returning' | 'follow-up' | 'priority';

const normalizedTags = (contact: Contact) => (contact.tags || []).map((tag) => tag.toLowerCase());

const daysSince = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - timestamp) / 86_400_000);
};

const needsFollowUp = (contact: Contact) => {
  const tags = normalizedTags(contact);
  return (
    tags.some((tag) => ['follow-up', 'follow up', 'recall', 'estimate', 'no-show', 'maintenance due'].includes(tag)) ||
    ((contact.total_calls ?? 0) > 0 && daysSince(contact.last_call_at) >= 14)
  );
};

const isPriority = (contact: Contact) => {
  const tags = normalizedTags(contact);
  return tags.some((tag) => ['urgent', 'emergency', 'dental emergency', 'no heat', 'no cooling', 'vip'].includes(tag));
};

const contactStatus = (contact: Contact) => {
  if (isPriority(contact)) return { label: 'Priority', cls: 'border-rose-200 bg-rose-50 text-rose-700' };
  if (needsFollowUp(contact)) return { label: 'Follow-up', cls: 'border-amber-200 bg-amber-50 text-amber-700' };
  if ((contact.total_calls ?? 0) > 1) return { label: 'Returning', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  return { label: 'New', cls: 'border-blue-200 bg-blue-50 text-blue-700' };
};

const nextAction = (contact: Contact) => {
  if (isPriority(contact)) return 'Call now';
  if (needsFollowUp(contact)) return 'Follow up';
  if ((contact.total_calls ?? 0) <= 1) return 'Review lead';
  return 'View history';
};

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<SmartView>('all');
  const [adding, setAdding] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const load = async () => {
    try {
      setContacts(await contactsAPI.listContacts());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Deep-link support: /dashboard/contacts?phone=+1555… opens that caller's
  // drawer (used by the dashboard's recent-activity avatars).
  useEffect(() => {
    const phone = searchParams.get('phone');
    if (!phone || contacts.length === 0) return;
    const digits = phone.replace(/\D/g, '');
    const match = contacts.find((c) => (c.phone_number || '').replace(/\D/g, '') === digits);
    if (match) navigate(`/dashboard/contacts/${match.id}`);
    // Consume the param either way so refreshes don't re-trigger.
    setSearchParams({}, { replace: true });
  }, [contacts, navigate, searchParams, setSearchParams]);

  // Unique tags across all contacts, for the filter row.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (activeView === 'new' && (c.total_calls ?? 0) > 1) return false;
      if (activeView === 'returning' && (c.total_calls ?? 0) <= 1) return false;
      if (activeView === 'follow-up' && !needsFollowUp(c)) return false;
      if (activeView === 'priority' && !isPriority(c)) return false;
      if (activeTag && !c.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())) return false;
      if (!q) return true;
      return (
        displayName(c).toLowerCase().includes(q) ||
        (c.phone_number || '').toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [contacts, query, activeTag, activeView]);

  const returningCount = useMemo(() => contacts.filter((c) => (c.total_calls ?? 0) > 1).length, [contacts]);
  const newCount = useMemo(() => contacts.filter((c) => (c.total_calls ?? 0) <= 1).length, [contacts]);
  const followUpCount = useMemo(() => contacts.filter(needsFollowUp).length, [contacts]);
  const priorityCount = useMemo(() => contacts.filter(isPriority).length, [contacts]);

  const handleCreated = (contact: Contact, existed: boolean) => {
    setAdding(false);
    setContacts((prev) => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev.map((c) => (c.id === contact.id ? { ...c, ...contact } : c));
      }
      return [contact, ...prev];
    });
    // Open the new (or matched) contact so the user lands right on its profile.
    navigate(`/dashboard/contacts/${contact.id}`);
    if (existed) {
      setQuery('');
      setActiveTag(null);
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto w-full max-w-[1240px] space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">Customer workspace</div>
              <h1 className="text-3xl font-semibold text-slate-900">Contacts</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                See who needs attention, remember every conversation, and take the next useful action.
              </p>
            </div>
            <button
              onClick={() => setAdding(true)}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-[10px] bg-blue-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:self-auto"
            >
              <UserPlus size={15} /> New contact
            </button>
          </div>

          {/* A compact answer to: where should I spend time today? */}
          {!loading && contacts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard icon={Users} label="All contacts" value={contacts.length} note="Known callers" active={activeView === 'all'} onClick={() => setActiveView('all')} />
              <MetricCard icon={UserRoundPlus} label="New leads" value={newCount} note="One conversation" active={activeView === 'new'} onClick={() => setActiveView('new')} />
              <MetricCard icon={Clock3} label="Follow-up" value={followUpCount} note="Ready for action" active={activeView === 'follow-up'} onClick={() => setActiveView('follow-up')} />
              <MetricCard icon={Siren} label="Priority" value={priorityCount} note="Urgent or VIP" tone="rose" active={activeView === 'priority'} onClick={() => setActiveView('priority')} />
            </div>
          )}

          {/* Toolbar */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <SmartViewButton label="All" count={contacts.length} active={activeView === 'all'} onClick={() => setActiveView('all')} />
                <SmartViewButton label="New" count={newCount} active={activeView === 'new'} onClick={() => setActiveView('new')} />
                <SmartViewButton label="Returning" count={returningCount} active={activeView === 'returning'} onClick={() => setActiveView('returning')} />
                <SmartViewButton label="Follow-up" count={followUpCount} active={activeView === 'follow-up'} onClick={() => setActiveView('follow-up')} />
                <SmartViewButton label="Priority" count={priorityCount} active={activeView === 'priority'} onClick={() => setActiveView('priority')} />
              </div>

              <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, number, or tag…"
                  className="w-full rounded-[10px] border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-[13px] text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={load}
                className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <FilterChip active={activeTag === null} onClick={() => setActiveTag(null)}>
                  All
                </FilterChip>
                {allTags.map((t) => (
                  <FilterChip key={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)}>
                    {t}
                  </FilterChip>
                ))}
                {(activeTag || query.trim()) && filtered.length > 0 && (
                  <button
                    onClick={() =>
                      navigate('/dashboard/campaigns', {
                        state: {
                          recipients: filtered.map((c) => ({
                            id: c.id,
                            name: displayName(c),
                            phone: c.phone_number,
                          })),
                        },
                      })
                    }
                    className="ml-auto flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Megaphone size={12} /> Campaign these {filtered.length}
                  </button>
                )}
              </div>
            )}
            </div>

            {error && (
              <div className="m-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

          {/* List */}
          <div>
            {loading ? (
              <ul className="divide-y divide-slate-100">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Users size={22} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">No contacts yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  As customers call your AI, they’re saved here automatically — with their call history, so returning
                  callers are recognised.
                </p>
                <button
                  onClick={() => setAdding(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <UserPlus size={16} /> Add your first contact
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-slate-400">
                No contacts match “{query || activeTag}”.
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(120px,.65fr)_110px_120px_24px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 md:grid">
                  <span>Customer</span><span>Status</span><span>Calls</span><span>Next action</span><span />
                </div>
                <ul className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const status = contactStatus(c);
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => navigate(`/dashboard/contacts/${c.id}`)}
                          className="grid w-full grid-cols-[minmax(0,1fr)_24px] items-center gap-3 px-4 py-3.5 text-left transition hover:bg-blue-50/30 md:grid-cols-[minmax(0,1.4fr)_minmax(120px,.65fr)_110px_120px_24px] md:gap-4 md:px-5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase ${avatarColor(c.id)}`}
                            >
                              {initials(c)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-slate-800">{displayName(c)}</span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                                <span className="truncate">{formatPhone(c.phone_number)}</span>
                                {c.tags?.slice(0, 2).map((t) => (
                                  <span key={t} className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-slate-500 sm:inline">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:block">
                            <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-semibold ${status.cls}`}>
                              {status.label}
                            </span>
                          </div>

                          <div className="hidden md:block">
                            <div className="text-sm font-semibold tabular-nums text-slate-700">{c.total_calls ?? 0}</div>
                            <div className="text-[11px] text-slate-400">{relativeDate(c.last_call_at)}</div>
                          </div>

                          <div className="hidden items-center gap-1.5 text-xs font-semibold text-slate-600 md:flex">
                            {nextAction(c)} <ArrowUpRight size={12} className="text-slate-400" />
                          </div>

                          <ChevronRight size={16} className="shrink-0 justify-self-end text-slate-300" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      {adding && <AddContactModal onClose={() => setAdding(false)} onCreated={handleCreated} />}
    </DashboardLayout>
  );
};

const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

const SmartViewButton = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    {label}
    <span className={active ? 'text-white/60' : 'text-slate-400'}>{count}</span>
  </button>
);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  note,
  tone = 'blue',
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  note: string;
  tone?: 'blue' | 'rose';
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`group flex min-h-[104px] items-start justify-between rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
      active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
    }`}
  >
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-900">{value}</div>
      <div className="mt-1 text-[11px] text-slate-400">{note}</div>
    </div>
    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
      <Icon size={16} strokeWidth={2.1} />
    </div>
  </button>
);

export default Contacts;
