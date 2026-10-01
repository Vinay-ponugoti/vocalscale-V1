import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Megaphone, Users, Upload, X, Search, Plus, Play, Loader2,
  CheckCircle2, AlertCircle, Phone, ChevronRight, ChevronLeft, Clock, CalendarClock,
  FileSpreadsheet, Download, ShieldCheck, Eye, Pause, RotateCcw,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import { PAGE_CONTAINER } from '../../../constants/layout';
import { campaignsAPI, type Campaign, type CampaignRow, type CampaignImportResult, type CampaignPreview } from '../../../api/campaigns';
import { useQuery } from '@tanstack/react-query';

interface Recipient {
  key: string;
  contactId?: string;
  prospectId?: string;
  name: string;
  phone: string;
  eligible?: boolean;
  blockedReason?: string;
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

type View = 'list' | 'builder' | 'detail';

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
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<CampaignImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [launching, setLaunching] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleAt, setScheduleAt] = useState('');
  const [goal, setGoal] = useState('Book a short human consultation with the owner or manager.');
  const [offer, setOffer] = useState('A personalized missed-call workflow review and a no-pressure demo.');
  const [disclosure, setDisclosure] = useState("This is VocalScale's AI assistant using an artificial voice, calling for the sales demonstration you requested.");
  const [questions, setQuestions] = useState('How are unanswered and after-hours calls handled?\nWould improving response time help the team?');
  const [guardrails, setGuardrails] = useState('Never invent savings, losses, or business facts.\nRespect opt-outs immediately.\nDo not pressure the prospect.');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [campaignPreview, setCampaignPreview] = useState<CampaignPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // History state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [detail, setDetail] = useState<{ campaign: Campaign; rows: CampaignRow[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: prospects = [], isLoading: loadingProspects, refetch: refetchProspects } = useQuery({
    queryKey: ['campaign-prospects'],
    queryFn: () => campaignsAPI.listProspects(),
    staleTime: 30_000,
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

  const updateCampaignStatus = async (id: string, status: 'paused' | 'scheduled' | 'stopped') => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await campaignsAPI.setStatus(id, status);
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not update campaign');
    } finally {
      loadCampaigns();
    }
  };

  const retryCampaign = async (id: string) => {
    try {
      await campaignsAPI.retry(id);
      await loadCampaigns();
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not retry campaign rows');
    }
  };

  const filteredProspects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prospects;
    return prospects.filter((p) => [p.business_name, p.phone_number, p.city, p.category].some((v) => (v || '').toLowerCase().includes(q)));
  }, [prospects, query]);

  const selectedList = Object.values(selected);
  const canPreview = selectedList.length > 0 && instruction.trim().length >= 5 && instruction.length <= 500 && !previewing;
  const canLaunch = canPreview && !!campaignPreview?.summary.ready && !launching;

  const toggleProspect = (id: string) => {
    const prospect = prospects.find((p) => p.id === id);
    if (!prospect) return;
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { key: id, prospectId: id, name: prospect.business_name, phone: prospect.phone_number, eligible: prospect.ai_call_eligible, blockedReason: prospect.blocked_reason };
      return next;
    });
    setCampaignPreview(null);
  };

  const runImport = async (mode: 'preview' | 'commit') => {
    if (!importFile && !pasteText.trim()) {
      setLaunchError('Choose an Excel/CSV file or paste business rows first.');
      return;
    }
    setImporting(true);
    setLaunchError('');
    try {
      const result = await campaignsAPI.importProspects({ file: importFile || undefined, paste: importFile ? undefined : pasteText, mode });
      setImportResult(result);
      if (mode === 'commit') await refetchProspects();
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not import businesses');
    } finally {
      setImporting(false);
    }
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
    setCampaignPreview(null);
    setPasteText('');
    setPasteOpen(false);
  };

  const removeSelected = (key: string) => {
    setCampaignPreview(null);
    setSelected((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const buildPayload = (scheduledISO?: string) => ({
    name: name.trim() || `Campaign — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    instruction: instruction.trim(),
    goal: goal.trim(),
    offer: offer.trim(),
    disclosure_text: disclosure.trim(),
    qualification_criteria: questions.split('\n').map((v) => v.trim()).filter(Boolean),
    guardrails: guardrails.split('\n').map((v) => v.trim()).filter(Boolean),
    recipients: selectedList.map((r) => ({ contact_id: r.contactId, prospect_id: r.prospectId, name: r.name, phone: r.phone })),
    scheduled_at: scheduledISO,
  });

  const previewCalls = async () => {
    if (!canPreview) return;
    setPreviewing(true);
    setLaunchError('');
    try {
      setCampaignPreview(await campaignsAPI.preview(buildPayload()));
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Could not preview campaign');
    } finally {
      setPreviewing(false);
    }
  };

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
      await campaignsAPI.create(buildPayload(scheduledISO));

      // All runs, including "send now", are executed by the server-owned
      // scheduler. Closing this page cannot interrupt outbound calls.
      await loadCampaigns();
      setView('list');
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
    setCampaignPreview(null);
    setView('builder');
  };

  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
          {/* ---------- DETAIL VIEW ---------- */}
          {view === 'detail' && (
            <>
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft size={16} /> Back to campaigns
              </button>

              {loadingDetail ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />
                  ))}
                </div>
              ) : !detail ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <EmptyState icon={Megaphone} tone="danger" title="Couldn't load this campaign" description="Go back and try again." />
                </div>
              ) : (
                <>
                  <PageHeader
                    title={detail.campaign.name}
                    meta={<StatusChip status={detail.campaign.status} />}
                    description={`${formatDate(detail.campaign.created_at)} · ${detail.rows.length} recipients`}
                  />
                  <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm italic text-slate-600 shadow-sm">
                    “{detail.campaign.instruction}”
                  </p>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <ul className="divide-y divide-slate-100">
                      {detail.rows.map((r) => (
                        <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                          <RowStatusIcon status={r.status} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">{r.recipient_name || 'Unnamed contact'}</p>
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
              <PageHeader
                title="Campaigns"
                description="Have your agent call a list: reminders, win-backs, or follow-ups."
                actions={<Button onClick={startNew}><Plus size={16} /> New campaign</Button>}
              />

              {loadingList ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <EmptyState
                    icon={Megaphone}
                    title="No campaigns yet"
                    description="Pick a list of contacts and give your agent one goal. It calls each of them and reports back here."
                    action={<Button onClick={startNew}><Plus size={16} /> New campaign</Button>}
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                          <div className="mr-3 flex shrink-0 items-center gap-1">
                            {(cm.status === 'scheduled' || cm.status === 'running') && <button title="Pause" onClick={() => updateCampaignStatus(cm.id, 'paused')} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"><Pause size={14} /></button>}
                            {cm.status === 'paused' && <button title="Resume" onClick={() => updateCampaignStatus(cm.id, 'scheduled')} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Play size={14} /></button>}
                            {(cm.status === 'paused' || cm.status === 'stopped') && <button title="Retry blocked or failed rows" onClick={() => retryCampaign(cm.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><RotateCcw size={14} /></button>}
                            {isScheduled && <button title="Stop" onClick={() => cancelCampaign(cm.id)} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-rose-50 hover:text-rose-600">Stop</button>}
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
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
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft size={16} /> Back to campaigns
              </button>
              <PageHeader title="New campaign" description="Choose who to call and what your agent should accomplish." />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
                {/* LEFT: recipients */}
                <div className="space-y-4 lg:col-span-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users size={16} className="text-slate-400" /> Recipients
                        {selectedList.length > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {selectedList.length}
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setPasteOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
                          <Upload size={13} /> Paste
                        </button>
                        <button onClick={() => setImportOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                          <FileSpreadsheet size={13} /> Import Excel / CSV
                        </button>
                      </div>
                    </div>

                    {importOpen && (
                      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
                            <FileSpreadsheet size={15} /> {importFile?.name || 'Choose .xlsx, .csv or .tsv'}
                            <input type="file" accept=".xlsx,.csv,.tsv" className="hidden" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
                          </label>
                          <button onClick={() => campaignsAPI.download('import-template', 'vocalscale_campaign_import_template.csv')} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-white">
                            <Download size={14} /> Template
                          </button>
                          <button onClick={() => campaignsAPI.download('export', 'vocalscale_campaign_prospects.csv')} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-white">
                            <Download size={14} /> Export saved
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">Imports business knowledge and consent records. A public phone number does not count as permission for an AI call.</p>
                        <div className="mt-3 flex gap-2">
                          <button disabled={importing || !importFile} onClick={() => runImport('preview')} className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50">Preview file</button>
                          <button disabled={importing || !importResult?.summary.valid} onClick={() => runImport('commit')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Save valid businesses</button>
                          {importing && <Loader2 size={16} className="animate-spin text-emerald-600" />}
                        </div>
                        {importResult && (
                          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {[['Rows', importResult.summary.total], ['Valid', importResult.summary.valid], ['Invalid', importResult.summary.invalid], ['Duplicates', importResult.summary.duplicates], ['Callable', importResult.summary.ai_call_eligible], ['Blocked', importResult.summary.blocked]].map(([label, value]) => (
                              <div key={String(label)} className="rounded-lg bg-white p-2 text-center"><div className="text-base font-bold text-slate-800">{value}</div><div className="text-[11px] uppercase text-slate-400">{label}</div></div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

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

                    <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Business knowledge base</span><span className="text-[11px] text-slate-400">{prospects.filter((p) => p.ai_call_eligible).length} callable</span></div>
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100">
                      {loadingProspects ? (
                        <div className="p-6 text-center text-sm text-slate-400">Loading contacts…</div>
                      ) : filteredProspects.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">
                          No saved businesses. Use Import Excel / CSV above.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-50">
                          {filteredProspects.map((p) => {
                            const checked = !!selected[p.id];
                            return (
                              <li key={p.id}>
                                <button
                                  onClick={() => toggleProspect(p.id)}
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
                                    <span className="block truncate text-sm text-slate-700">{p.business_name}</span>
                                    <span className="block truncate text-xs text-slate-400">{formatPhone(p.phone_number)}{p.city ? ` · ${p.city}` : ''}{p.category ? ` · ${p.category}` : ''}</span>
                                  </span>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.ai_call_eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} title={p.blocked_reason}>{p.ai_call_eligible ? 'Ready' : 'Needs consent'}</span>
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
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Phone size={16} className="text-slate-400" /> What should your agent say?
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
                      onChange={(e) => { setInstruction(e.target.value); setCampaignPreview(null); }}
                      rows={5}
                      maxLength={500}
                      placeholder="Describe the goal of the call in plain English…"
                      className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-400">
                      <span>{instruction.trim().length < 5 ? 'At least 5 characters' : 'Applied to every call'}</span>
                      <span>{instruction.length}/500</span>
                    </div>
                    <button onClick={() => setAdvancedOpen((v) => !v)} className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-blue-600">
                      Better call knowledge <span>{advancedOpen ? 'Hide' : 'Customize'}</span>
                    </button>
                    {advancedOpen && (
                      <div className="mt-3 space-y-3">
                        <Field label="Success goal" value={goal} onChange={(v) => { setGoal(v); setCampaignPreview(null); }} />
                        <Field label="Offer" value={offer} onChange={(v) => { setOffer(v); setCampaignPreview(null); }} />
                        <Field label="AI disclosure" value={disclosure} onChange={(v) => { setDisclosure(v); setCampaignPreview(null); }} />
                        <Field label="Qualification questions — one per line" value={questions} onChange={(v) => { setQuestions(v); setCampaignPreview(null); }} rows={3} />
                        <Field label="Guardrails — one per line" value={guardrails} onChange={(v) => { setGuardrails(v); setCampaignPreview(null); }} rows={3} />
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
                      onClick={previewCalls}
                      disabled={!canPreview}
                      className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {previewing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Preview every call
                    </button>
                    {campaignPreview && (
                      <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between text-xs"><span className="font-semibold text-emerald-700">{campaignPreview.summary.ready} ready</span><span className="font-semibold text-amber-700">{campaignPreview.summary.blocked} blocked</span></div>
                        {campaignPreview.rows.slice(0, 3).map((row) => <p key={row.row} className="mt-1 truncate text-[11px] text-slate-500">{row.ready ? '✓' : '⚠'} {row.business_name || row.phone}: {row.blocked_reason || 'brief ready'}</p>)}
                        {campaignPreview.summary.blocked > 0 && <p className="mt-2 text-[11px] text-amber-700">Blocked rows are saved for review but will not be dialed.</p>}
                      </div>
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
                      <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                      {scheduleMode === 'later'
                        ? 'Runs automatically at the scheduled time. Live consent and do-not-call status are checked again before dialing.'
                        : 'Review is required first. Only businesses with documented written AI-call consent can be dialed.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
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
    case 'blocked':
      return <ShieldCheck size={16} className="shrink-0 text-amber-500" />;
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
    blocked: { cls: 'text-amber-600', label: 'Blocked' },
    skipped: { cls: 'text-slate-400', label: 'Skipped' },
  };
  const { cls, label } = map[status];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
};

const StatusChip = ({ status }: { status: Campaign['status'] }) => {
  const map: Record<Campaign['status'], string> = {
    draft: 'bg-slate-100 text-slate-600',
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

const Field = ({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) => (
  <label className="block">
    <span className="mb-1 block text-[11px] font-semibold text-slate-500">{label}</span>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full resize-y rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
  </label>
);

const SentimentChip = ({ sentiment }: { sentiment: string }) => {
  const s = sentiment.toLowerCase();
  const cls =
    s === 'positive' ? 'bg-emerald-50 text-emerald-700' : s === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500';
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cls}`}>{sentiment}</span>;
};

export default Campaigns;
