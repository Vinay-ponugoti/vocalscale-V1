import { useEffect, useRef, useState } from 'react';
import { X, Loader2, UserPlus, Phone, Tag as TagIcon, Plus } from 'lucide-react';
import { contactsAPI, type Contact } from '../../../api/contacts';

interface Props {
  onClose: () => void;
  // Fired with the created (or matched) contact and whether it already existed.
  onCreated: (contact: Contact, existed: boolean) => void;
}

export const AddContactModal = ({ onClose, onCreated }: Props) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    phoneRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addTag = () => {
    const t = tagDraft.trim();
    setTagDraft('');
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags((prev) => [...prev, t]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const { contact, existed } = await contactsAPI.createContact({
        phone_number: phone.trim(),
        display_name: name.trim() || undefined,
        tags,
        notes: notes.trim() || undefined,
      });
      onCreated(contact, existed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserPlus size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-900">New contact</h2>
            <p className="text-xs text-slate-500">Add a caller manually — e.g. to tag a VIP before they call.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Phone number <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={phoneRef}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                inputMode="tel"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div>
            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <TagIcon size={12} /> Tags
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-slate-600"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                    aria-label={`Remove ${t}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <span className="relative inline-flex items-center">
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag"
                  className="w-24 rounded-full border border-dashed border-slate-300 py-1 pl-3 pr-6 text-xs text-slate-700 outline-none transition focus:w-32 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="absolute right-1.5 text-slate-400 hover:text-blue-600"
                  aria-label="Add tag"
                >
                  <Plus size={13} />
                </button>
              </span>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anything your team should remember…"
              className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !phone.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            Add contact
          </button>
        </div>
      </form>
    </div>
  );
};
