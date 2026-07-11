import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import {
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Network,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Star,
  Trash2,
  UserRound,
  Volume2,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { agentsAPI, type Agent, type AgentContextDocument, type PhoneNumber } from '../../../api/agents';
import { GeneratedContext } from './GeneratedContext';
import { VoicePicker } from './VoicePicker';
import { WebCallPreview } from '../../../components/dashboard/WebCallPreview';
import { useAuth } from '../../../context/AuthContext';
import { useVoices } from '../../../hooks/useVoices';
import { cn } from '../../../lib/utils';

const TOOL_OPTIONS = [
  { id: 'booking', label: 'Booking' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'search_knowledge', label: 'Knowledge' },
];

const PERSONA_TEMPLATES: { id: string; label: string; persona: string }[] = [
  {
    id: 'saas',
    label: 'SaaS / Software',
    persona:
      'You are the phone agent for a software company. Explain what the product does in plain, benefit-first language — no jargon. Answer pricing and plan questions accurately from the knowledge base, and treat every question as buying interest: after answering, offer a demo, trial, or callback from the team. Qualify leads naturally by asking what problem they are trying to solve, then connect it to the product.',
  },
  {
    id: 'local_service',
    label: 'Local service',
    persona:
      'You are the front desk phone agent for a local service business. Be warm, concise, accurate, and helpful. Answer questions about services, prices, and hours from the knowledge base, and guide callers toward booking an appointment. Use tools for knowledge, booking, transfer, and call ending when needed.',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    persona:
      'You are the phone host for a restaurant. Answer questions about the menu, hours, location, and specials from the knowledge base. Take reservations by collecting name, party size, date, and time. Be quick and friendly — callers are often deciding where to eat right now.',
  },
];

const DEFAULT_AGENT: Partial<Agent> = {
  name: 'Sales Agent',
  description: 'Conversion-focused call agent',
  agent_type: 'sales',
  tone: 'friendly',
  language: 'en',
  speaking_speed: 1,
  tools: ['booking', 'transfer', 'search_knowledge'],
  booking_required: ['Customer Name', 'Phone Number', 'Appointment Date', 'Appointment Time'],
  persona:
    'You are a sales-focused phone agent. Help callers understand the offer, answer accurately, reduce hesitation, and guide interested callers toward booking.',
};

const titleCase = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const relativeTime = (iso?: string) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Agents = () => {
  const { profile } = useAuth();
  const businessName = profile?.business_name || 'your business';
  const { voices } = useVoices();
  const [voiceOpen, setVoiceOpen] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState<Agent | null>(null);
  const [docs, setDocs] = useState<AgentContextDocument[]>([]);
  const [phones, setPhones] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const selectedPhoneIds = useMemo(
    () => phones.filter((phone) => phone.agent_id === selectedId).map((phone) => phone.id),
    [phones, selectedId]
  );

  const assignedNumbers = useMemo(
    () => phones.filter((phone) => phone.agent_id === selectedId).map((phone) => phone.phone_number),
    [phones, selectedId]
  );

  const phonesByAgent = useMemo(() => {
    const map = new Map<string, string[]>();
    phones.forEach((phone) => {
      if (!phone.agent_id) return;
      map.set(phone.agent_id, [...(map.get(phone.agent_id) || []), phone.phone_number]);
    });
    return map;
  }, [phones]);

  const readyCount = docs.filter((doc) => doc.ingest_status === 'ready').length;
  const hasPendingKnowledge = docs.some((doc) => doc.ingest_status === 'pending' || doc.ingest_status === 'ingesting');
  const lastCompiledAt = useMemo(() => {
    const times = docs.map((doc) => doc.updated_at).filter(Boolean) as string[];
    if (times.length === 0) return '';
    return times.sort().at(-1) || '';
  }, [docs]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [agentRows, phoneRows] = await Promise.all([
        agentsAPI.listAgents(),
        agentsAPI.listPhoneNumbers(),
      ]);
      setAgents(agentRows);
      setPhones(phoneRows);
      const nextId = selectedId && agentRows.some((a) => a.id === selectedId) ? selectedId : agentRows[0]?.id || '';
      setSelectedId(nextId);
      if (nextId) {
        await loadAgent(nextId);
      } else {
        setSelected(null);
        setDocs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load agents');
    } finally {
      setLoading(false);
    }
  };

  const loadAgent = async (id: string) => {
    if (!id) return;
    const agent = await agentsAPI.getAgent(id);
    setSelected(agent);
    setDocs(agent.context_documents || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadAgent(selectedId).catch((err) => setError(err instanceof Error ? err.message : 'Could not load agent'));
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !hasPendingKnowledge) return;
    const timer = setInterval(() => {
      agentsAPI.listContext(selectedId).then(setDocs).catch(() => undefined);
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedId, hasPendingKnowledge]);

  const createAgent = async () => {
    setSaving(true);
    setError('');
    try {
      // Auto-number duplicate names so new agents are distinguishable in the list
      const baseName = DEFAULT_AGENT.name || 'Agent';
      const taken = new Set(agents.map((a) => a.name));
      let name = baseName;
      for (let n = 2; taken.has(name); n++) name = `${baseName} ${n}`;
      const created = await agentsAPI.createAgent({ ...DEFAULT_AGENT, name });
      await load();
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create agent');
    } finally {
      setSaving(false);
    }
  };

  const deleteAgent = async (agent: Agent) => {
    if (agent.is_default) return;
    const numbers = phonesByAgent.get(agent.id) || [];
    const warning = numbers.length
      ? `Delete "${agent.name}"? Calls to ${numbers.join(', ')} will fall back to your default agent.`
      : `Delete "${agent.name}"? This can't be undone.`;
    if (!window.confirm(warning)) return;
    setDeletingId(agent.id);
    setError('');
    try {
      await agentsAPI.deleteAgent(agent.id);
      if (selectedId === agent.id) setSelectedId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete agent');
    } finally {
      setDeletingId('');
    }
  };

  const saveAgent = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await agentsAPI.updateAgent(selected.id, {
        name: selected.name,
        description: selected.description,
        agent_type: selected.agent_type,
        persona: selected.persona,
        voice_id: selected.voice_id || null,
        tone: selected.tone,
        language: selected.language,
        speaking_speed: Number(selected.speaking_speed),
        greeting: selected.greeting,
        tools: selected.tools,
        booking_required: selected.booking_required,
        is_active: selected.is_active,
        is_default: selected.is_default,
      });
      await agentsAPI.assignAgent(selected.id, selectedPhoneIds);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save agent');
    } finally {
      setSaving(false);
    }
  };

  const syncContext = async () => {
    if (!selected) return;
    setSyncing(true);
    setError('');
    try {
      await agentsAPI.syncContext(selected.id);
      setTimeout(() => agentsAPI.listContext(selected.id).then(setDocs).catch(() => undefined), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not recompile context');
    } finally {
      setSyncing(false);
    }
  };

  const updateSelected = <K extends keyof Agent>(key: K, value: Agent[K]) => {
    setSelected((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleTool = (tool: string) => {
    if (!selected) return;
    const tools = selected.tools || [];
    updateSelected(
      'tools',
      tools.includes(tool) ? tools.filter((item) => item !== tool) : [...tools, tool]
    );
  };

  const togglePhone = (phoneId: string) => {
    if (!selected) return;
    setPhones((prev) =>
      prev.map((phone) => {
        if (phone.id !== phoneId) return phone;
        return { ...phone, agent_id: phone.agent_id === selected.id ? null : selected.id };
      })
    );
  };

  const greetingPreview = (selected?.greeting || 'Hey there, thanks for calling {business_name}!')
    .replaceAll('{business_name}', businessName);

  const selectedVoice = voices.find((voice) => voice.id === selected?.voice_id);
  const selectedVoiceLabel = selectedVoice
    ? `${selectedVoice.name}${selectedVoice.accent ? ` · ${selectedVoice.accent}` : ''}`
    : 'Business default voice';

  return (
    <DashboardLayout fullWidth>
      <div className="h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto grid min-h-full w-full max-w-[1480px] grid-cols-1 gap-4 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900">Agents</h1>
                <p className="text-xs text-slate-500">{agents.length} configured</p>
              </div>
              <button
                onClick={createAgent}
                disabled={saving}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
                aria-label="Create agent"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>

            <div className="space-y-2 p-3">
              {loading ? (
                <div className="flex justify-center p-8 text-slate-400">
                  <Loader2 className="animate-spin" />
                </div>
              ) : agents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No agents yet.
                </div>
              ) : (
                agents.map((agent) => {
                  const numbers = phonesByAgent.get(agent.id) || [];
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        'group relative w-full rounded-lg border transition',
                        selectedId === agent.id
                          ? 'border-blue-200 bg-blue-50 text-blue-950'
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <button
                        onClick={() => setSelectedId(agent.id)}
                        className="w-full px-3 py-3 text-left"
                      >
                        <div className="flex items-center gap-1.5 pr-6">
                          <span className="truncate text-sm font-semibold">{agent.name}</span>
                          {agent.is_default && (
                            <span title="Default agent — answers unassigned numbers">
                              <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs capitalize text-slate-500">
                          {agent.agent_type.replaceAll('_', ' ')} · {agent.tone}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                          {numbers.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">
                              <Phone size={10} /> {numbers[0]}{numbers.length > 1 ? ` +${numbers.length - 1}` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-300">No number</span>
                          )}
                          {agent.updated_at && <span>{relativeTime(agent.updated_at)}</span>}
                        </div>
                      </button>
                      {!agent.is_default && (
                        <button
                          onClick={() => deleteAgent(agent)}
                          disabled={deletingId === agent.id}
                          className="absolute right-2 top-2.5 rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                          aria-label={`Delete ${agent.name}`}
                          title="Delete agent"
                        >
                          {deletingId === agent.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <main className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Network size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {selected?.name || 'Agent Builder'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selected?.description || 'Default hybrid call runtime'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={syncContext}
                    disabled={!selected || syncing}
                    title="Regenerate the knowledge documents from your current business profile"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                    Recompile context
                  </button>
                  <button
                    onClick={saveAgent}
                    disabled={!selected || saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FlowStep icon={UserRound} title="Caller" detail="Inbound voice call" done />
                <FlowStep
                  icon={Bot}
                  title="Agent"
                  detail={`${selected?.name || '—'} · ${titleCase(selected?.agent_type || 'front_desk')}`}
                  done={Boolean(selected)}
                />
                <FlowStep
                  icon={Volume2}
                  title="Voice & tone"
                  detail={`${titleCase(selected?.tone || 'professional')} · ${(selected?.language || 'en').toUpperCase()} · ${Number(selected?.speaking_speed || 1).toFixed(2)}x`}
                  done={Boolean(selected)}
                />
                <FlowStep
                  icon={Brain}
                  title="Persona"
                  detail={
                    selected?.persona
                      ? `${selected.persona.split(/\s+/).filter(Boolean).length} words defined`
                      : 'Not written yet'
                  }
                  done={Boolean(selected?.persona)}
                />
                <FlowStep
                  icon={Search}
                  title="Knowledge"
                  detail={docs.length ? `${readyCount} of ${docs.length} documents ready` : 'No documents compiled'}
                  done={readyCount > 0 && readyCount === docs.length}
                  busy={hasPendingKnowledge}
                />
                <FlowStep
                  icon={Phone}
                  title="Phone number"
                  detail={assignedNumbers.length ? assignedNumbers.join(', ') : 'Not assigned — uses default agent'}
                  done={assignedNumbers.length > 0}
                />
              </div>
            </section>

            {selected && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setVoiceOpen((v) => !v)}
                  aria-expanded={voiceOpen}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Volume2 size={17} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900">Voice</h2>
                      <p className="truncate text-xs text-slate-500">{selectedVoiceLabel}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-blue-600">
                    <span className="hidden sm:inline">{voiceOpen ? 'Close' : 'Change voice'}</span>
                    <ChevronDown size={16} className={cn('text-slate-400 transition-transform', voiceOpen && 'rotate-180')} />
                  </div>
                </button>
                {voiceOpen && (
                  <div className="border-t border-slate-100 p-4">
                    <VoicePicker
                      value={selected.voice_id}
                      language={selected.language || 'en'}
                      speakingSpeed={Number(selected.speaking_speed || 1)}
                      onChange={(voiceId) => updateSelected('voice_id', voiceId)}
                    />
                  </div>
                )}
              </section>
            )}

            <WebCallPreview />

            <GeneratedContext docs={docs} lastCompiledAt={lastCompiledAt} />
          </main>

          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 size={17} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Inspector</h2>
              </div>

              {selected ? (
                <div className="space-y-4">
                  <Field label="Name">
                    <input
                      value={selected.name}
                      onChange={(e) => updateSelected('name', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                  </Field>

                  <Field label="Role">
                    <select
                      value={selected.agent_type}
                      onChange={(e) => updateSelected('agent_type', e.target.value as Agent['agent_type'])}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    >
                      <option value="front_desk">Front Desk</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="after_hours">After Hours</option>
                      <option value="appointment_setter">Appointment Setter</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tone">
                      <select
                        value={selected.tone}
                        onChange={(e) => updateSelected('tone', e.target.value as Agent['tone'])}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="casual">Casual</option>
                      </select>
                    </Field>
                    <Field label="Language">
                      <select
                        value={selected.language}
                        onChange={(e) => updateSelected('language', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="nl">Dutch</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Speed">
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={selected.speaking_speed || 1}
                      onChange={(e) => updateSelected('speaking_speed', Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="mt-1 text-xs font-medium text-slate-500">{Number(selected.speaking_speed || 1).toFixed(2)}</div>
                  </Field>

                  <Field label="Greeting">
                    <input
                      value={selected.greeting || ''}
                      onChange={(e) => updateSelected('greeting', e.target.value)}
                      placeholder="Hey there, thanks for calling {business_name}!"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <p className="mt-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs leading-5 text-slate-500">
                      Callers hear: <span className="font-medium text-slate-700">“{greetingPreview}”</span>
                    </p>
                  </Field>

                  <Field label="Persona">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {PERSONA_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => updateSelected('persona', tpl.persona)}
                          title={`Replace persona with the ${tpl.label} template`}
                          className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={selected.persona || ''}
                      onChange={(e) => updateSelected('persona', e.target.value)}
                      rows={10}
                      placeholder="Describe who this agent is, how it should sound, and what it should steer callers toward…"
                      className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 outline-none focus:border-blue-400"
                    />
                  </Field>

                  <Field label="Tools">
                    <div className="grid grid-cols-3 gap-2">
                      {TOOL_OPTIONS.map((tool) => {
                        const active = selected.tools?.includes(tool.id);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => toggleTool(tool.id)}
                            className={cn(
                              'rounded-lg border px-2 py-2 text-xs font-semibold transition',
                              active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            )}
                          >
                            {tool.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-slate-400">Select an agent.</div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Phone size={17} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Phone Assignment</h2>
              </div>
              <div className="space-y-2">
                {phones.length === 0 ? (
                  <p className="text-sm text-slate-400">No numbers found.</p>
                ) : (
                  phones.map((phone) => {
                    const assigned = selected && phone.agent_id === selected.id;
                    return (
                      <button
                        key={phone.id}
                        onClick={() => togglePhone(phone.id)}
                        disabled={!selected}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition disabled:opacity-50',
                          assigned ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <span className="truncate">{phone.friendly_name || phone.phone_number}</span>
                        {assigned ? <CheckCircle2 size={15} /> : <span className="text-xs text-slate-400">Assign</span>}
                      </button>
                    );
                  })
                )}
                <p className="pt-1 text-[11px] leading-4 text-slate-400">
                  Changes apply when you press Save. Unassigned numbers are answered by the default agent.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

const FlowStep = ({
  icon: Icon,
  title,
  detail,
  done = false,
  busy = false,
}: {
  icon: ElementType;
  title: string;
  detail: string;
  done?: boolean;
  busy?: boolean;
}) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-lg border p-3',
      done ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'
    )}
  >
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        done ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'
      )}
    >
      <Icon size={15} />
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {busy ? (
          <Loader2 size={12} className="animate-spin text-blue-500" />
        ) : done ? (
          <CheckCircle2 size={13} className="text-emerald-600" />
        ) : null}
      </div>
      <p className="mt-0.5 text-xs leading-4 text-slate-500">{detail}</p>
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    {children}
  </label>
);

export default Agents;
