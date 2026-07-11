import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Megaphone, Users, Upload, X, Search, Plus, Play, Pause, Square, Loader2,
  CheckCircle2, AlertCircle, Phone, ChevronRight, ChevronLeft, Clock, CalendarClock,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { contactsAPI } from '../../../api/contacts';
import { callsApi } from '../../../api/calls';
import { campaignsAPI, type Campaign, type CampaignRow } from '../../../api/campaigns';
import { useQuery } from '@tanstack/react-query';

interface Recipient {
  key: string;
  contactId?: string;
  name: string;
  phone: string;
}

const TEMPLATES = [
  {
    key: 'reminder',
    label: 'Appointment reminder',
    text: 'Call to remind them about their upcoming appointment. Confirm the date and time, and offer to reschedule if it no longer works.',
  },
  {
    key: 'reactivation',
    label: 'Win-back / reactivation',
    text: "Call to check in — it's been a while since their last visit. Let them know we'd love to have them back and mention any current offer.",
  },
  {
    key: 'lead',
    label: 'Lead follow-up',
    text: 'Call to follow up on their recent inquiry. Answer any questions, gauge interest, and try to book a time to move forward.',
  },
];

const normalizePhone = (raw: string) => {
  const p = raw.replace(/[^\d+]/g, '');
  if (!p) return '';
  if (p.startsWith('+')) return p;
  if (p.length === 10) return `+1${p}`;
  if (p.length === 11 && p.startsWith('1')) return `+${p}`;
  return `+${p}`;
};

const formatPhone = (raw: string) => {
  const m = raw.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1 (${m[1]}) ${m[2]}-${m[3]}` : raw;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type View = 'list' | 'builder' | 'run' | 'detail';

const Campaigns = () => {
  const location = useLocation();
  const preselect = (location.state as { recipients?: Array<{ id: string; name: string; phone: string }> } | null)
    ?.recipients;

  const [view, setView] = useState<View>(preselect?.length ? 'builder' : 'list');

  // Builder state
  const [name, setName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [selected, setSelected] = useState<Record<string, Recipient>>(() => {
    if (!preselect?.length) return {};
    const initial: Record<string, Recipient> = {};
    preselect.forEach((r) => {
      initial[r.id] = { key: r.id, contactId: r.id, name: r.name, phone: r.phone };
    });
    return initial;
  });
  const [query, setQuery] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [launchError, setLaunchError] = useState('');
  const [launching, setLaunching] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleAt, setScheduleAt] = useState('');

  // Run state
  const [runCampaign, setRunCampaign] = useState<Campaign | null>(null);
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const control = useRef({ paused: false, stopped: false });

  // History state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [detail, setDetail] = useState<{ campaign: Campaign; rows: CampaignRow[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['campaign-contacts'],
    queryFn: () => contactsAPI.listContacts(),
    staleTime: 60_000,
  });

  const loadCampaigns = async () => {
    setLoadingList(true);
    try {
      setCampaigns(await campaignsAPI.list());
    } catch {
      setCampaigns([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Poll the history while anything is scheduled or running server-side, so
  // progress and outcomes appear without a manual refresh.
  useEffect(() => {
    if (view !== 'list') return;
    const active = campaigns.some((c) => c.status === 'scheduled' || c.status === 'running');
    if (!active) return;
    const t = setInterval(loadCampaigns, 15_000);
    return () => clearInterval(t);
  }, [view, campaigns]);

  const cancelCampaign = async (id: string) => {
    // Optimistic: reflect the cancel immediately.
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'stopped' } : c)));
    try {
      await campaignsAPI.setStatus(id, 'stopped');
    } finally {
      loadCampaigns();
    }
  };

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => (c.display_name || '').toLowerCase().includes(q) || (c.phone_number || '').toLowerCase().includes(q),
    );
  }, [contacts, query]);

  const selectedList = Object.values(selected);
  const canLaunch = selectedList.length > 0 && instruction.trim().length >= 5 && instruction.length <= 500 && !launching;

  const toggleContact = (id: string, cname: string, phone: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { key: id, contactId: id, name: cname || 'Customer', phone };
      return next;
    });
  };

  const addPasted = () => {
    const added: Record<string, Recipient> = {};
    pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line, i) => {
        const parts = line.split(/[,\t]/).map((p) => p.trim());
        let rname = '';
        let rawPhone = line;
        if (parts.length >= 2) {
          rname = parts[0];
          rawPhone = parts.slice(1).join(' ');
        }
        const phone = normalizePhone(rawPhone);
        if (phone.replace(/\D/g, '').length < 7) return;
        const key = `paste:${phone}:${i}`;
        added[key] = { key, name: rname || 'Customer', phone };
      });
    setSelected((prev) => ({ ...prev, ...added }));
    setPasteText('');
    setPasteOpen(false);
  };

  const removeSelected = (key: string) =>
    setSelected((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // Persisted sequential dialer: each result is PATCHed to the server so the
  // run survives refresh and outcomes can be joined later.
  const dial = async (campaign: Campaign, queue: CampaignRow[]) => {
    setRunning(true);
    setPaused(false);
    control.current = { paused: false, stopped: false };

    const markRow = async (row: CampaignRow, patch: Partial<CampaignRow>) => {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
      try {
        await campaignsAPI.updateRow(row.id, {
          status: (patch.status ?? row.status) as CampaignRow['status'],
          call_id: patch.call_id ?? undefined,
          error: patch.error ?? undefined,
        });
      } catch {
        /* local state still reflects it; server misses one beat */
      }
    };

    let stopped = false;
    for (let i = 0; i < queue.length; i++) {
      if (control.current.stopped) {
        stopped = true;
        break;
      }
      while (control.current.paused && !control.current.stopped) await delay(300);
      if (control.current.stopped) {
        stopped = true;
        break;
      }

      const row = queue[i];
      setActiveRowId(row.id);
      await markRow(row, { status: 'calling' });
      try {
        const res = await callsApi.startOutboundCall(row.phone_number, campaign.instruction, row.recipient_name);
        await markRow(row, { status: 'called', call_id: res?.call_id });
      } catch (err) {
        await markRow(row, { status: 'failed', error: err instanceof Error ? err.message : 'Call failed' });
      }
      if (i < queue.length - 1) await delay(2500);
    }

    if (stopped) {
      // Mark whatever never dialed as skipped.
      const pending = queue.filter((r) => {
        const current = rowsRef.current.find((x) => x.id === r.id);
        return (current?.status ?? r.status) === 'queued';
      });
      for (const r of pending) await markRow(r, { status: 'skipped' });
    }

    try {
      await campaignsAPI.setStatus(campaign.id, stopped ? 'stopped' : 'completed');
    } catch {
      /* non-fatal */
    }
    setActiveRowId(null);
    setRunning(false);
    setPaused(false);
    loadCampaigns();
  };

  // dial() reads latest row state through a ref to avoid stale closures.
  const rowsRef = useRef<CampaignRow[]>([]);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const launch = async () => {
    if (!canLaunch) return;

    // Validate a future time when scheduling.
    let scheduledISO: string | undefined;
    if (scheduleMode === 'later') {
      const when = new Date(scheduleAt);
      if (!scheduleAt || Number.isNaN(when.getTime())) {
        setLaunchError('Pick a date and time to schedule.');
        return;
      }
      if (when.getTime() < Date.now() + 60_000) {
        setLaunchError('Scheduled time must be at least a minute from now.');
        return;
      }
      scheduledISO = when.toISOString();
    }

    setLaunching(true);
    setLaunchError('');
    try {
      const { campaign, rows: serverRows } = await campaignsAPI.create({
        name: name.trim() || `Campaign — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        instruction: instruction.trim(),
        recipients: selectedList.map((r) => ({ contact_id: r.contactId, name: r.name, phone: r.phone })),
        scheduled_at: scheduledISO,
      });

      if (campaign.status === 'scheduled') {
        // Server will dial at the scheduled time — no browser run.
        await loadCampaigns();
        setView('list');
      } else {
        setRunCampaign(campaign);
        setRows(serverRows);
        setView('run');
        dial(campaign, serverRows);
      }
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not start the campaign');
    } finally {
      setLaunching(false);
    }
  };

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setView('detail');
    try {
      setDetail(await campaignsAPI.get(id));
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const startNew = () => {
    setSelected({});
    setInstruction('');
    setName('');
    setLaunchError('');
    setView('builder');
  };

  const counts = {
    called: rows.filter((r) => r.status === 'called').length,
    failed: rows.filter((r) => r.status === 'failed').length,
    skipped: rows.filter((r) => r.status === 'skipped').length,
  };
  const progress = rows.length
    ? Math.round((rows.filter((r) => r.status !== 'queued' && r.status !== 'calling').length / rows.length) * 100)
    : 0;

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto w-full max-w-[1100px] space-y-5 px-4 py-6 md:px-6 md:py-8">
          {/* ---------- RUN VIEW ---------- */}
          {view === 'run' && runCampaign && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {running ? 'Campaign running…' : 'Campaign complete'}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {runCampaign.name} · {counts.called} called · {counts.failed} failed
                    {counts.skipped ? ` · ${counts.skipped} skipped` : ''} of {rows.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {running ? (
                    <>
                      <button
                        onClick={() => {
                          control.current.paused = !control.current.paused;
                          setPaused(control.current.paused);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {paused ? <Play size={15} /> : <Pause size={15} />}
                        {paused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => {
                          control.current.stopped = true;
                          control.current.paused = false;
                          setPaused(false);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                      >
                        <Square size={14} /> Stop
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setView('list')}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        History
                      </button>
                      <button
                        onClick={startNew}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Plus size={15} /> New campaign
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{progress}% complete</span>
                  {running && !paused && (
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <Loader2 size={12} className="animate-spin" /> dialing
                    </span>
                  )}
                  {paused && <span className="text-amber-600">paused</span>}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <ul className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <li key={r.id} className={`flex items-center gap-3 px-5 py-3 ${r.id === activeRowId ? 'bg-blue-50/40' : ''}`}>
                      <RowStatusIcon status={r.status} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{r.recipient_name || 'Customer'}</p>
                        <p className="truncate text-xs text-slate-400">{formatPhone(r.phone_number)}</p>
                      </div>
                      <span className="shrink-0 text-right">
                        <RowStatusLabel status={r.status} />
                        {r.error && <span className="block max-w-[180px] truncate text-[11px] text-rose-500">{r.error}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-center text-xs text-slate-400">
                This run is saved — check outcomes anytime from campaign history, even after closing this page.
              </p>
            </>
          )}

          {/* ---------- DETAIL VIEW ---------- */}
          {view === 'detail' && (
            <>
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft size={16} /> All campaigns
              </button>

              {loadingDetail ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
              ) : !detail ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
                  Could not load this campaign.
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{detail.campaign.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(detail.campaign.created_at)} · {detail.rows.length} recipients ·{' '}
                      <StatusChip status={detail.campaign.status} />
                    </p>
                    <p className="mt-2 rounded-xl bg-slate-100/70 px-3 py-2 text-sm italic text-slate-600">
                      “{detail.campaign.instruction}”
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                    <ul className="divide-y divide-slate-100">
                      {detail.rows.map((r) => (
                        <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                          <RowStatusIcon status={r.status} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">{r.recipient_name || 'Customer'}</p>
                            <p className="truncate text-xs text-slate-400">{formatPhone(r.phone_number)}</p>
                            {r.outcome?.summary && (
                              <p className="mt-0.5 truncate text-xs text-slate-500">{r.outcome.summary}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {r.outcome?.sentiment && <SentimentChip sentiment={r.outcome.sentiment} />}
                            {r.outcome?.status && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {r.outcome.status}
                              </span>
                            )}
                            {(r.outcome?.duration_seconds ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock size={11} /> {Math.round((r.outcome!.duration_seconds ?? 0) / 60)}m
                              </span>
                            )}
                            <RowStatusLabel status={r.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}

          {/* ---------- LIST VIEW ---------- */}
          {view === 'list' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Megaphone size={20} />
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Outbound campaigns</h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Have your AI call a list — reminders, win-backs, or lead follow-ups.
                    </p>
                  </div>
                </div>
                <button
                  onClick={startNew}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">New campaign</span>
                </button>
              </div>

              {loadingList ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Megaphone size={22} />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">No campaigns yet</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    Pick a list of customers and give the AI one goal — it calls each of them and reports back here.
                  </p>
                  <button
                    onClick={startNew}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} /> Create your first campaign
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                  <ul className="divide-y divide-slate-100">
                    {campaigns.map((cm) => {
                      const called = cm.counts?.called ?? 0;
                      const failed = cm.counts?.failed ?? 0;
                      const isScheduled = cm.status === 'scheduled';
                      return (
                        <li key={cm.id} className="flex items-center transition hover:bg-slate-50">
                          <button
                            onClick={() => openDetail(cm.id)}
                            className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 text-left"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-slate-800">{cm.name}</span>
                                <StatusChip status={cm.status} />
                              </div>
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {isScheduled && cm.scheduled_at ? (
                                  <span className="font-medium text-blue-600">
                                    Runs {formatDateTime(cm.scheduled_at)}
                                  </span>
                                ) : (
                                  formatDate(cm.created_at)
                                )}
                                {' · '}“{cm.instruction}”
                              </p>
                            </div>
                            <div className="shrink-0 text-right text-xs">
                              {isScheduled ? (
                                <span className="flex items-center gap-1 text-blue-600">
                                  <CalendarClock size={13} /> {cm.total_recipients} queued
                                </span>
                              ) : (
                                <>
                                  <span className="font-semibold text-emerald-600">{called} called</span>
                                  {failed > 0 && <span className="ml-2 font-semibold text-rose-500">{failed} failed</span>}
                                  <span className="ml-2 text-slate-400">of {cm.total_recipients}</span>
                                </>
                              )}
                            </div>
                          </button>
                          {isScheduled ? (
                            <button
                              onClick={() => cancelCampaign(cm.id)}
                              className="mr-3 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              Cancel
                            </button>
                          ) : (
                            <ChevronRight size={16} className="mr-4 shrink-0 text-slate-300" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* ---------- BUILDER VIEW ---------- */}
          {view === 'builder' && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('list')}
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Megaphone size={20} />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">New campaign</h1>
                  <p className="mt-1 text-sm text-slate-500">Pick who to call and what the AI should accomplish.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                {/* LEFT: recipients */}
                <div className="space-y-4 lg:col-span-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users size={16} className="text-slate-400" /> Recipients
                        {selectedList.length > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {selectedList.length}
                          </span>
                        )}
                      </h2>
                      <button
                        onClick={() => setPasteOpen((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <Upload size={13} /> Paste a list
                      </button>
                    </div>

                    {pasteOpen && (
                      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <textarea
                          value={pasteText}
                          onChange={(e) => setPasteText(e.target.value)}
                          rows={4}
                          placeholder={'One per line:\nJane Doe, +1 555 123 4567\n+1 555 987 6543'}
                          className="w-full resize-y rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-400"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => setPasteOpen(false)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200/60"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addPasted}
                            disabled={!pasteText.trim()}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Plus size={13} /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="relative mb-2">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search contacts…"
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100">
                      {loadingContacts ? (
                        <div className="p-6 text-center text-sm text-slate-400">Loading contacts…</div>
                      ) : filteredContacts.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">
                          No contacts. Paste a list above to add recipients.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-50">
                          {filteredContacts.map((c) => {
                            const checked = !!selected[c.id];
                            return (
                              <li key={c.id}>
                                <button
                                  onClick={() => toggleContact(c.id, c.display_name, c.phone_number)}
                                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50"
                                >
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                      checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                    }`}
                                  >
                                    {checked && <CheckCircle2 size={12} className="text-white" />}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm text-slate-700">
                                      {c.display_name && c.display_name !== 'Unknown'
                                        ? c.display_name
                                        : formatPhone(c.phone_number)}
                                    </span>
                                    <span className="block truncate text-xs text-slate-400">
                                      {formatPhone(c.phone_number)}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {selectedList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {selectedList.slice(0, 12).map((r) => (
                          <span
                            key={r.key}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs text-slate-600"
                          >
                            {r.name}
                            <button
                              onClick={() => removeSelected(r.key)}
                              className="rounded-full p-0.5 hover:bg-slate-200 hover:text-rose-600"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                        {selectedList.length > 12 && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                            +{selectedList.length - 12} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: name + objective + launch */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Phone size={16} className="text-slate-400" /> What should the AI say?
                    </h2>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Campaign name (optional)"
                      className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => {
                            setInstruction(t.text);
                            if (!name.trim()) setName(t.label);
                          }}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      rows={5}
                      maxLength={500}
                      placeholder="Describe the goal of the call in plain English…"
                      className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-400">
                      <span>{instruction.trim().length < 5 ? 'At least 5 characters' : 'Applied to every call'}</span>
                      <span>{instruction.length}/500</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Recipients</span>
                      <span className="font-semibold text-slate-900">{selectedList.length}</span>
                    </div>

                    {/* Send now vs schedule */}
                    <div className="mb-3 inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        onClick={() => setScheduleMode('now')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          scheduleMode === 'now' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        <Play size={14} /> Send now
                      </button>
                      <button
                        onClick={() => setScheduleMode('later')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          scheduleMode === 'later' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        <CalendarClock size={14} /> Schedule
                      </button>
                    </div>

                    {scheduleMode === 'later' && (
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                        onChange={(e) => setScheduleAt(e.target.value)}
                        className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    )}

                    <button
                      onClick={launch}
                      disabled={!canLaunch || (scheduleMode === 'later' && !scheduleAt)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {launching ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : scheduleMode === 'later' ? (
                        <CalendarClock size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {scheduleMode === 'later' ? 'Schedule campaign' : 'Launch campaign'}
                    </button>
                    {launchError && <p className="mt-2 text-xs text-rose-600">{launchError}</p>}
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      {scheduleMode === 'later'
                        ? 'Runs automatically at the scheduled time — no need to keep this open. Counts toward plan minutes.'
                        : 'Calls dial one at a time and count toward your plan minutes. The run is saved to history.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const RowStatusIcon = ({ status }: { status: CampaignRow['status'] }) => {
  switch (status) {
    case 'calling':
      return <Loader2 size={16} className="shrink-0 animate-spin text-blue-600" />;
    case 'called':
      return <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />;
    case 'failed':
      return <AlertCircle size={16} className="shrink-0 text-rose-500" />;
    case 'skipped':
      return <ChevronRight size={16} className="shrink-0 text-slate-300" />;
    default:
      return <span className="ml-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-200" />;
  }
};

const RowStatusLabel = ({ status }: { status: CampaignRow['status'] }) => {
  const map: Record<CampaignRow['status'], { cls: string; label: string }> = {
    queued: { cls: 'text-slate-400', label: 'Queued' },
    calling: { cls: 'text-blue-600', label: 'Calling…' },
    called: { cls: 'text-emerald-600', label: 'Called' },
    failed: { cls: 'text-rose-600', label: 'Failed' },
    skipped: { cls: 'text-slate-400', label: 'Skipped' },
  };
  const { cls, label } = map[status];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
};

const StatusChip = ({ status }: { status: Campaign['status'] }) => {
  const map: Record<Campaign['status'], string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    running: 'bg-blue-50 text-blue-700',
    paused: 'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-700',
    stopped: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${map[status] || map.stopped}`}>
      {status}
    </span>
  );
};

const SentimentChip = ({ sentiment }: { sentiment: string }) => {
  const s = sentiment.toLowerCase();
  const cls =
    s === 'positive' ? 'bg-emerald-50 text-emerald-700' : s === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cls}`}>{sentiment}</span>;
};

export default Campaigns;
