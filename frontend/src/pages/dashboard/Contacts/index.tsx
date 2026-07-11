import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, RefreshCw, Repeat, ChevronRight, UserPlus, Megaphone } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { contactsAPI, type Contact } from '../../../api/contacts';
import { ContactDrawer } from './ContactDrawer';
import { AddContactModal } from './AddContactModal';
import { avatarColor, displayName, formatPhone, initials, relativeDate } from './utils';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (match) setSelectedId(match.id);
    // Consume the param either way so refreshes don't re-trigger.
    setSearchParams({}, { replace: true });
  }, [contacts, searchParams, setSearchParams]);

  // Unique tags across all contacts, for the filter row.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (activeTag && !c.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())) return false;
      if (!q) return true;
      return (
        displayName(c).toLowerCase().includes(q) ||
        (c.phone_number || '').toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [contacts, query, activeTag]);

  const returningCount = useMemo(() => contacts.filter((c) => (c.total_calls ?? 0) > 1).length, [contacts]);

  const applyUpdate = (updated: Contact) =>
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));

  const handleCreated = (contact: Contact, existed: boolean) => {
    setAdding(false);
    setContacts((prev) => {
      if (prev.some((c) => c.id === contact.id)) {
        return prev.map((c) => (c.id === contact.id ? { ...c, ...contact } : c));
      }
      return [contact, ...prev];
    });
    // Open the new (or matched) contact so the user lands right on it.
    setSelectedId(contact.id);
    if (existed) {
      setQuery('');
      setActiveTag(null);
    }
  };

  const selectedSeed = contacts.find((c) => c.id === selectedId);

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto w-full max-w-[1100px] space-y-5 px-4 py-6 md:px-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
              <p className="mt-1 text-sm text-slate-500">
                Everyone who’s called your business — with the history your AI remembers.
              </p>
            </div>
            {!loading && contacts.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">
                  <span className="font-semibold text-slate-900">{contacts.length}</span> contacts
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Repeat size={14} className="text-emerald-500" />
                  <span className="font-semibold text-slate-900">{returningCount}</span> returning
                </span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, number, or tag…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={load}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">New contact</span>
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
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Megaphone size={12} /> Campaign these {filtered.length}
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* List */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
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
              <ul className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const returning = (c.total_calls ?? 0) > 1;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase ${avatarColor(
                            c.id,
                          )}`}
                        >
                          {initials(c)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-slate-800">{displayName(c)}</span>
                            {returning && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                <Repeat size={10} /> Returning
                              </span>
                            )}
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

                        <div className="hidden shrink-0 text-right sm:block">
                          <div className="text-sm font-medium text-slate-700">
                            {c.total_calls ?? 0} call{(c.total_calls ?? 0) === 1 ? '' : 's'}
                          </div>
                          <div className="text-xs text-slate-400">{relativeDate(c.last_call_at)}</div>
                        </div>

                        <ChevronRight size={16} className="shrink-0 text-slate-300" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedId && (
        <ContactDrawer
          contactId={selectedId}
          seed={selectedSeed}
          onClose={() => setSelectedId(null)}
          onUpdated={applyUpdate}
        />
      )}

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

export default Contacts;
