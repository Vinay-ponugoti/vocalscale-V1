import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  MessageSquareText,
  Pencil,
  Phone,
  PhoneOutgoing,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { contactsAPI, type CallMemory, type Contact } from '../../../api/contacts';
import { callsApi } from '../../../api/calls';
import {
  avatarColor,
  displayName,
  formatDate,
  formatPhone,
  initials,
  relativeDate,
  sentimentStyle,
} from './utils';

type ProfileTab = 'overview' | 'calls';

const QUICK_TAGS = ['Dental recall', 'No-show', 'HVAC estimate', 'Maintenance due', 'Urgent', 'VIP'];

const ContactProfile = () => {
  const { contactId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: ProfileTab = searchParams.get('tab') === 'calls' ? 'calls' : 'overview';

  const [contact, setContact] = useState<Contact | null>(null);
  const [memories, setMemories] = useState<CallMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saved, setSaved] = useState(false);
  const [callEditorOpen, setCallEditorOpen] = useState(false);
  const [callInstruction, setCallInstruction] = useState('');
  const [calling, setCalling] = useState(false);
  const [callResult, setCallResult] = useState<{ ok: boolean; message: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    contactsAPI
      .getContact(contactId)
      .then((result) => {
        if (!alive) return;
        setContact(result.contact);
        setMemories(result.memories || []);
        setNotesDraft(result.contact.preferences?.notes ?? '');
        setError('');
      })
      .catch((reason) => {
        if (!alive) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load this contact');
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [contactId]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const updateContact = async (patch: Parameters<typeof contactsAPI.updateContact>[1]) => {
    if (!contact) return;
    const updated = await contactsAPI.updateContact(contact.id, patch);
    setContact(updated);
    return updated;
  };

  const saveName = async () => {
    const next = nameDraft.trim();
    setEditingName(false);
    if (!contact || !next || next === contact.display_name) return;
    try {
      await updateContact({ display_name: next });
    } catch {
      setNameDraft(contact.display_name || '');
    }
  };

  const addTag = async (value: string) => {
    const next = value.trim();
    if (!contact || !next || contact.tags?.some((tag) => tag.toLowerCase() === next.toLowerCase())) return;
    setTagDraft('');
    try {
      await updateContact({ tags: [...(contact.tags || []), next] });
    } catch {
      // Keep the existing tags when the request fails.
    }
  };

  const removeTag = async (tag: string) => {
    if (!contact) return;
    try {
      await updateContact({ tags: (contact.tags || []).filter((item) => item !== tag) });
    } catch {
      // Keep the existing tags when the request fails.
    }
  };

  const saveNotes = async () => {
    if (!contact) return;
    setSavingNotes(true);
    try {
      await updateContact({ notes: notesDraft });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setSavingNotes(false);
    }
  };

  const startCallDraft = (instruction?: string) => {
    if (!contact) return;
    const who = displayName(contact);
    setCallInstruction(instruction || `Follow up with ${who}. Check in, understand what they need, and help them take the next step.`);
    setCallResult(null);
    setCallEditorOpen(true);
  };

  const placeAiCall = async () => {
    if (!contact || calling || callInstruction.trim().length < 5) return;
    setCalling(true);
    setCallResult(null);
    try {
      await callsApi.startOutboundCall(contact.phone_number, callInstruction.trim(), displayName(contact));
      setCallResult({ ok: true, message: 'Call placed. Its outcome will appear in the Calls tab.' });
      setCallEditorOpen(false);
    } catch (reason) {
      setCallResult({ ok: false, message: reason instanceof Error ? reason.message : 'Could not place the call' });
    } finally {
      setCalling(false);
    }
  };

  const nextAction = useMemo(() => {
    if (!contact) return null;
    const tags = (contact.tags || []).map((tag) => tag.toLowerCase());
    if (tags.some((tag) => ['urgent', 'emergency', 'no heat', 'no cooling'].includes(tag))) {
      return { eyebrow: 'Priority customer', title: 'Call as soon as possible', detail: 'This contact is marked for urgent attention.', tone: 'rose' as const };
    }
    if (tags.some((tag) => ['follow-up', 'dental recall', 'hvac estimate', 'maintenance due', 'no-show'].includes(tag))) {
      return { eyebrow: 'Follow-up ready', title: 'Continue the conversation', detail: 'Use the saved context to make the next call useful.', tone: 'amber' as const };
    }
    if ((contact.total_calls ?? 0) <= 1) {
      return { eyebrow: 'New relationship', title: 'Review the first conversation', detail: 'Confirm what they need and decide the next step.', tone: 'blue' as const };
    }
    return { eyebrow: 'Returning customer', title: 'Keep the relationship warm', detail: 'Their previous calls are ready for context.', tone: 'emerald' as const };
  }, [contact]);

  const notesDirty = contact ? (contact.preferences?.notes ?? '') !== notesDraft : false;

  if (loading) {
    return (
      <DashboardLayout fullWidth>
        <div className="h-full overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-[1240px] animate-pulse space-y-5">
            <div className="h-10 w-32 rounded-lg bg-slate-200" />
            <div className="h-40 rounded-2xl bg-white" />
            <div className="grid gap-5 lg:grid-cols-3"><div className="h-80 rounded-2xl bg-white lg:col-span-2" /><div className="h-80 rounded-2xl bg-white" /></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contact || error) {
    return (
      <DashboardLayout fullWidth>
        <div className="flex h-full items-center justify-center p-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600"><UserRound size={21} /></div>
            <h1 className="mt-4 text-xl font-semibold">Contact unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">{error || 'This contact could not be found.'}</p>
            <button onClick={() => navigate('/dashboard/contacts')} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Back to contacts</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const firstName = displayName(contact).split(' ')[0];

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))]">
        <div className="mx-auto w-full max-w-[1320px] space-y-5 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <button onClick={() => navigate('/dashboard/contacts')} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeft size={15} /> All contacts
          </button>

          <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Persistent identity rail: customer facts and editable relationship data. */}
            <aside className="space-y-4 lg:sticky lg:top-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-6 text-center">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] text-2xl font-semibold uppercase shadow-sm ${avatarColor(contact.id)}`}>
                    {initials(contact)}
                  </div>
                  {editingName ? (
                    <input
                      ref={nameInputRef}
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onBlur={saveName}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveName();
                        if (event.key === 'Escape') setEditingName(false);
                      }}
                      className="mt-4 w-full rounded-lg border border-blue-300 px-2 py-1.5 text-center text-xl font-semibold text-slate-900 outline-none ring-2 ring-blue-100"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setNameDraft(contact.display_name && contact.display_name !== 'Unknown' ? contact.display_name : '');
                        setEditingName(true);
                      }}
                      className="group mx-auto mt-4 flex max-w-full items-center justify-center gap-2 text-center"
                    >
                      <h1 className="truncate text-xl font-semibold text-slate-950">{displayName(contact)}</h1>
                      <Pencil size={14} className="shrink-0 text-slate-300 transition group-hover:text-slate-600" />
                    </button>
                  )}
                  <a href={`tel:${contact.phone_number}`} className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600"><Phone size={14} /> {formatPhone(contact.phone_number)}</a>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button onClick={() => setSearchParams({ tab: 'calls' })} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Headphones size={15} /> History
                    </button>
                    <button onClick={() => startCallDraft()} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">
                      <PhoneOutgoing size={15} /> AI call
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px bg-slate-100">
                    <SnapshotStat label="Conversations" value={String(contact.total_calls ?? 0)} icon={Phone} />
                    <SnapshotStat label="First call" value={formatDate(contact.first_call_at)} icon={Clock3} />
                    <SnapshotStat label="Last call" value={relativeDate(contact.last_call_at)} icon={RotateCcw} />
                  </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"><Tag size={14} /> Relationship tags</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contact.tags?.map((tag) => (
                      <span key={tag} className="group inline-flex items-center gap-1 rounded-md bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-slate-600">
                        {tag}<button onClick={() => removeTag(tag)} className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600" aria-label={`Remove ${tag}`}><X size={11} /></button>
                      </span>
                    ))}
                    <span className="relative inline-flex items-center">
                      <input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTag(tagDraft)} placeholder="Add tag" className="w-24 rounded-md border border-dashed border-slate-300 py-1 pl-2.5 pr-6 text-xs outline-none focus:w-32 focus:border-blue-400" />
                      <button onClick={() => addTag(tagDraft)} className="absolute right-1.5 text-slate-400 hover:text-blue-600" aria-label="Add tag"><Plus size={12} /></button>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {QUICK_TAGS.map((tag) => (
                      <button key={tag} disabled={contact.tags?.some((item) => item.toLowerCase() === tag.toLowerCase())} onClick={() => addTag(tag)} className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-30">+ {tag}</button>
                    ))}
                  </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"><MessageSquareText size={14} /> Private notes</div>
                  <textarea value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} rows={4} placeholder="Anything your team should remember…" className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                  <div className="mt-3 flex justify-end">
                    <button onClick={saveNotes} disabled={savingNotes || !notesDirty} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40">
                      {savingNotes ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}{saved ? 'Saved' : 'Save note'}
                    </button>
                  </div>
              </section>
            </aside>

            {/* Right workspace: a single job at a time, with stable tabs and actions. */}
            <main className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Customer relationship</div>
                    <h1 className="mt-1.5 text-2xl font-semibold text-slate-950">{activeTab === 'calls' ? 'Conversation history' : `Working with ${firstName}`}</h1>
                    <p className="mt-1 text-sm text-slate-500">{activeTab === 'calls' ? 'Review context, outcomes and full call details.' : 'One place for context, follow-up and the next useful action.'}</p>
                  </div>
                  <button onClick={() => startCallDraft()} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    <PhoneOutgoing size={15} /> Have AI call
                  </button>
                </div>
                <nav className="flex gap-1 border-t border-slate-100 px-4 pt-2 md:px-6" aria-label="Contact profile sections">
                  <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setSearchParams({})} />
                  <TabButton label="Calls" count={memories.length} active={activeTab === 'calls'} onClick={() => setSearchParams({ tab: 'calls' })} />
                </nav>
              </section>

              {callResult && (
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${callResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  {callResult.ok ? <CheckCircle2 size={16} /> : <X size={16} />} {callResult.message}
                </div>
              )}

              {activeTab === 'overview' ? (
                <>
                  {nextAction && (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
                        <div>
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${nextAction.tone === 'rose' ? 'text-rose-600' : nextAction.tone === 'amber' ? 'text-amber-600' : nextAction.tone === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`}>{nextAction.eyebrow}</div>
                          <h2 className="mt-2 text-xl font-semibold text-slate-950">{nextAction.title}</h2>
                          <p className="mt-1 text-sm text-slate-500">{nextAction.detail}</p>
                        </div>
                        <button onClick={() => startCallDraft()} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-slate-900 px-4 text-[13px] font-semibold text-white hover:bg-slate-800">Start follow-up <ArrowUpRight size={14} /></button>
                      </div>
                    </section>
                  )}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"><Bot size={14} /> Suggested conversations</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <Preset label="Dental recall" icon={Sparkles} onClick={() => startCallDraft(`Call ${displayName(contact)} to schedule their routine dental recall. Be warm and offer available appointment times.`)} />
                      <Preset label="HVAC estimate" icon={Wrench} onClick={() => startCallDraft(`Follow up with ${displayName(contact)} about their HVAC estimate. Answer questions and help them choose the next step without being pushy.`)} />
                      <Preset label="Appointment" icon={CalendarCheck} onClick={() => startCallDraft(`Call ${displayName(contact)} to confirm or reschedule their appointment. Keep the conversation concise and helpful.`)} />
                      <Preset label="General check-in" icon={MessageSquareText} onClick={() => startCallDraft()} />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <SectionHeader eyebrow="Recent activity" title="What you last discussed" description="AI-written summaries, kept concise for fast follow-up." action={memories.length > 3 ? <button onClick={() => setSearchParams({ tab: 'calls' })} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all calls</button> : undefined} />
                    <ConversationList memories={memories.slice(0, 3)} />
                  </section>
                </>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <SectionHeader eyebrow="Call history" title={`${memories.length} conversation${memories.length === 1 ? '' : 's'}`} description="Open any call to review its full transcript, recording and operational details." />
                  <ConversationList memories={memories} detailed />
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {callEditorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" onClick={() => setCallEditorOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">AI outbound call</div><h2 className="mt-1 text-xl font-semibold text-slate-950">What should the call accomplish?</h2></div>
              <button onClick={() => setCallEditorOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close call editor"><X size={18} /></button>
            </div>
            <textarea value={callInstruction} onChange={(event) => setCallInstruction(event.target.value)} rows={5} maxLength={500} className="mt-4 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            <p className="mt-2 text-xs text-slate-400">Review the goal before starting. The AI will use the customer’s saved context.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCallEditorOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
              <button onClick={placeAiCall} disabled={calling || callInstruction.trim().length < 5} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {calling ? <Loader2 size={15} className="animate-spin" /> : <PhoneOutgoing size={15} />} Call now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const TabButton = ({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`relative flex items-center gap-2 px-3 py-3 text-[13px] font-semibold transition ${active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'}`}>
    {label}{typeof count === 'number' && <span className={`rounded px-1.5 py-0.5 text-[10px] ${active ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{count}</span>}
    {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600" />}
  </button>
);

const SectionHeader = ({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 p-5 md:p-6">
    <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{eyebrow}</div><h2 className="mt-1.5 text-lg font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}
  </div>
);

const SnapshotStat = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
  <div className="min-w-0 bg-white px-4 py-4 md:px-5"><Icon size={15} className="text-slate-400" /><div className="mt-2 truncate text-sm font-semibold text-slate-900">{value}</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</div></div>
);

const Preset = ({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick: () => void }) => (
  <button onClick={onClick} className="flex min-h-16 flex-col items-start justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"><Icon size={15} className="text-slate-400" /><span className="mt-2 text-[11px] font-semibold text-slate-600">{label}</span></button>
);

const ConversationList = ({ memories, detailed = false }: { memories: CallMemory[]; detailed?: boolean }) => {
  if (memories.length === 0) {
    return <div className="border-t border-slate-100 px-6 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Headphones size={19} /></div><p className="mt-3 text-sm font-semibold text-slate-700">No conversations yet</p><p className="mt-1 text-sm text-slate-400">Call summaries will appear here after the AI speaks with this customer.</p></div>;
  }
  return (
    <ol className="divide-y divide-slate-100 border-t border-slate-100">
      {memories.map((memory) => {
        const sentiment = sentimentStyle(memory.sentiment);
        return (
          <li key={memory.id} className="px-5 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">{formatDate(memory.created_at)}</span>
                  {sentiment && <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${sentiment.cls}`}>{sentiment.label}</span>}
                  {memory.appointment_booked && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"><CalendarCheck size={11} /> Booked</span>}
                  {memory.order_placed && <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700"><ShoppingBag size={11} /> Order</span>}
                </div>
                <p className={`mt-2 text-sm leading-6 text-slate-700 ${detailed ? 'max-w-3xl' : 'line-clamp-3'}`}>{memory.summary}</p>
                {memory.key_topics?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{memory.key_topics.map((topic) => <span key={topic} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">{topic}</span>)}</div>}
              </div>
              {memory.call_id && <Link to={`/dashboard/calls/${memory.call_id}`} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">Open call <ArrowUpRight size={13} /></Link>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ContactProfile;
