import type { Contact } from '../../../api/contacts';

export const displayName = (c: Pick<Contact, 'display_name' | 'phone_number'>) => {
  const n = (c.display_name || '').trim();
  return n && n.toLowerCase() !== 'unknown' ? n : c.phone_number || 'Unknown caller';
};

export const initials = (c: Pick<Contact, 'display_name' | 'phone_number'>) => {
  const name = displayName(c);
  // If it's a phone number, use the last two digits; otherwise first letters.
  if (/^[+\d]/.test(name)) {
    const digits = name.replace(/\D/g, '');
    return digits.slice(-2) || '#';
  }
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

// Deterministic soft avatar colour from the id so a caller keeps the same hue.
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
];
export const avatarColor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const formatPhone = (raw?: string | null) => {
  if (!raw) return '';
  const m = raw.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  if (m) return `+1 (${m[1]}) ${m[2]}-${m[3]}`;
  return raw;
};

export const relativeDate = (iso?: string | null) => {
  if (!iso) return 'never';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.round((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  if (d < 30) return `${Math.round(d / 7)} wk ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const sentimentStyle = (sentiment?: string | null) => {
  switch ((sentiment || '').toLowerCase()) {
    case 'positive':
    case 'happy':
      return { cls: 'bg-emerald-50 text-emerald-700', label: 'Positive' };
    case 'negative':
    case 'angry':
    case 'frustrated':
      return { cls: 'bg-red-50 text-red-600', label: 'Negative' };
    case 'neutral':
      return { cls: 'bg-slate-100 text-slate-500', label: 'Neutral' };
    default:
      return sentiment
        ? { cls: 'bg-slate-100 text-slate-500', label: sentiment }
        : null;
  }
};
