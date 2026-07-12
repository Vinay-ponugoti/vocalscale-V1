import { useEffect, useRef, useState } from 'react';
import {
  X, Phone, Loader2, Check, Pencil, Tag as TagIcon, Plus, CalendarCheck,
  ShoppingBag, MessageSquareText, Sparkles, PhoneOutgoing, CheckCircle2,
  HeartPulse, Wrench, CalendarClock, MessageCircleMore,
} from 'lucide-react';
import { contactsAPI, type Contact, type CallMemory } from '../../../api/contacts';
import { callsApi } from '../../../api/calls';
import { avatarColor, displayName, formatDate, formatPhone, initials, relativeDate, sentimentStyle } from './utils';

interface Props {
  contactId: string;
  // A lightweight seed so the panel can render instantly while the full
  // detail (memories) loads in the background.
  seed?: Contact;
  onClose: () => void;
  onUpdated: (c: Contact) => void;
}

export const ContactDrawer = ({ contactId, seed, onClose, onUpdated }: Props) => {
  const [contact, setContact] = useState<Contact | null>(seed ?? null);
  const [memories, setMemories] = useState<CallMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [aiCallOpen, setAiCallOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiSending, setAiSending] = useState(false);
  const [aiResult, setAiResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    contactsAPI
      .getContact(contactId)
      .then((res) => {
        if (!alive) return;
        setContact(res.contact);
        setMemories(res.memories || []);
        setNotesDraft(res.contact.preferences?.notes ?? '');
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [contactId]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const patch = async (body: Parameters<typeof contactsAPI.updateContact>[1]) => {
    if (!contact) return;
    const updated = await contactsAPI.updateContact(contact.id, body);
    setContact(updated);
    onUpdated(updated);
    return updated;
  };

  const saveName = async () => {
    const name = nameDraft.trim();
    setEditingName(false);
    if (!contact || !name || name === contact.display_name) return;
    try {
      await patch({ display_name: name });
    } catch {
      /* keep prior name on failure */
    }
  };

  const addTagValue = async (value: string) => {
    const t = value.trim();
    if (!contact || !t) return;
    const exists = contact.tags?.some((x) => x.toLowerCase() === t.toLowerCase());
    setTagDraft('');
    if (exists) return;
    try {
      await patch({ tags: [...(contact.tags || []), t] });
    } catch {
      /* ignore */
    }
  };

  const addTag = () => addTagValue(tagDraft);

  const removeTag = async (tag: string) => {
    if (!contact) return;
    try {
      await patch({ tags: (contact.tags || []).filter((x) => x !== tag) });
    } catch {
      /* ignore */
    }
  };

  const saveNotes = async () => {
    if (!contact) return;
    setSavingNotes(true);
    try {
      await patch({ notes: notesDraft });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setSavingNotes(false);
    }
  };

  const c = contact;
  const notesDirty = c ? (c.preferences?.notes ?? '') !== notesDraft : false;

  const openAiCall = (instruction?: string) => {
    if (!c) return;
    // Prefill with the contact's context so the owner just hits Call.
    const who = displayName(c);
    const returning = (c.total_calls ?? 0) > 1 ? ' They are a returning customer.' : '';
    setAiInstruction(
      instruction || `Follow up with ${who}.${returning} Check in, see if they need anything, and help with whatever comes up.`,
    );
    setAiResult(null);
    setAiCallOpen(true);
  };

  const sendAiCall = async () => {
    if (!c || aiInstruction.trim().length < 5 || aiSending) return;
    setAiSending(true);
    setAiResult(null);
    try {
      await callsApi.startOutboundCall(c.phone_number, aiInstruction.trim(), displayName(c));
      setAiResult({ ok: true, msg: 'Call placed — the result will appear in Call Logs.' });
      setAiCallOpen(false);
    } catch (err) {
      setAiResult({ ok: false, msg: err instanceof Error ? err.message : 'Could not place the call' });
    } finally {
      setAiSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-[slideIn_0.2s_ease-out]">
        <style>{`@keyframes slideIn { from { transform: translateX(24px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }`}</style>

        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          {c && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase ${avatarColor(
                c.id,
              )}`}
            >
              {initials(c)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="w-full rounded-lg border border-blue-300 px-2 py-1 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Contact name"
              />
            ) : (
              <button
                onClick={() => {
                  if (!c) return;
                  setNameDraft(c.display_name && c.display_name !== 'Unknown' ? c.display_name : '');
                  setEditingName(true);
                }}
                className="group flex max-w-full items-center gap-1.5 text-left"
              >
                <span className="truncate text-base font-semibold text-slate-900">
                  {c ? displayName(c) : ''}
                </span>
                <Pencil size={13} className="shrink-0 text-slate-300 group-hover:text-slate-500" />
              </button>
            )}
            {c && (
              <a
                href={`tel:${c.phone_number}`}
                className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600"
              >
                <Phone size={13} /> {formatPhone(c.phone_number)}
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Stats */}
          {c && (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Calls" value={String(c.total_calls ?? 0)} accent={(c.total_calls ?? 0) > 1} />
              <Stat label="First call" value={formatDate(c.first_call_at)} />
              <Stat label="Last call" value={relativeDate(c.last_call_at)} />
            </div>
          )}

          {/* AI call action */}
          {c && (
            <section>
              {!aiCallOpen && (
                <div className="mb-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Sparkles size={13} /> Suggested follow-ups
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FollowUpPreset
                      icon={HeartPulse}
                      label="Dental recall"
                      onClick={() => openAiCall(`Call ${displayName(c)} to schedule their routine dental recall. Be warm, offer available appointment times, and answer basic scheduling questions.`)}
                    />
                    <FollowUpPreset
                      icon={CalendarClock}
                      label="Appointment"
                      onClick={() => openAiCall(`Call ${displayName(c)} to confirm or reschedule their upcoming appointment. Keep the conversation concise and helpful.`)}
                    />
                    <FollowUpPreset
                      icon={Wrench}
                      label="HVAC estimate"
                      onClick={() => openAiCall(`Follow up with ${displayName(c)} about their HVAC estimate. Ask whether they have questions and help them choose the next step without being pushy.`)}
                    />
                    <FollowUpPreset
                      icon={MessageCircleMore}
                      label="General check-in"
                      onClick={() => openAiCall()}
                    />
                  </div>
                </div>
              )}
              {!aiCallOpen ? (
                <button
                  onClick={() => openAiCall()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <PhoneOutgoing size={15} /> Have AI call {displayName(c).split(' ')[0]}
                </button>
              ) : (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="mb-2 text-xs font-medium text-slate-600">
                    What should the AI accomplish on this call?
                  </p>
                  <textarea
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setAiCallOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendAiCall}
                      disabled={aiSending || aiInstruction.trim().length < 5}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {aiSending ? <Loader2 size={13} className="animate-spin" /> : <PhoneOutgoing size={13} />}
                      Call now
                    </button>
                  </div>
                </div>
              )}
              {aiResult && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                    aiResult.ok ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {aiResult.ok ? <CheckCircle2 size={13} /> : <X size={13} />}
                  {aiResult.msg}
                </p>
              )}
            </section>
          )}

          {/* Tags */}
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <TagIcon size={13} /> Tags
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {c?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-slate-600"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-red-600"
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <span className="relative inline-flex items-center">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag"
                  className="w-24 rounded-full border border-dashed border-slate-300 py-1 pl-3 pr-6 text-xs text-slate-700 outline-none transition focus:w-32 focus:border-blue-400"
                />
                <button
                  onClick={addTag}
                  className="absolute right-1.5 text-slate-400 hover:text-blue-600"
                  aria-label="Add tag"
                >
                  <Plus size={13} />
                </button>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['Dental recall', 'No-show', 'HVAC estimate', 'Maintenance due', 'Urgent', 'VIP'].map((tag) => {
                const exists = c?.tags?.some((current) => current.toLowerCase() === tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    onClick={() => addTagValue(tag)}
                    disabled={exists}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-default disabled:opacity-35"
                  >
                    + {tag}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <MessageSquareText size={13} /> Private notes
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              placeholder="Anything your team should remember about this caller…"
              className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {(notesDirty || notesSaved) && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={saveNotes}
                  disabled={savingNotes || !notesDirty}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingNotes ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : notesSaved ? (
                    <Check size={13} />
                  ) : null}
                  {notesSaved ? 'Saved' : 'Save note'}
                </button>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section>
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Sparkles size={13} /> Call history
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : memories.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                No call summaries yet. They’ll appear here after your AI talks to this caller.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {memories.map((m) => {
                  const s = sentimentStyle(m.sentiment);
                  return (
                    <li key={m.id} className="relative">
                      <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-500">{formatDate(m.created_at)}</span>
                        {s && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>
                            {s.label}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{m.summary}</p>
                      {(m.key_topics?.length || m.appointment_booked || m.order_placed) && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {m.appointment_booked && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                              <CalendarCheck size={11} /> Booked
                            </span>
                          )}
                          {m.order_placed && (
                            <span className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                              <ShoppingBag size={11} /> Order
                            </span>
                          )}
                          {m.key_topics?.map((t) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
    <div className={`truncate text-sm font-semibold ${accent ? 'text-blue-600' : 'text-slate-800'}`}>{value}</div>
    <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
  </div>
);

const FollowUpPreset = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <Icon size={14} />
    </span>
    {label}
  </button>
);
