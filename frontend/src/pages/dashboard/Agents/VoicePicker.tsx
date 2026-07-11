import { useMemo, useState } from 'react';
import { Check, Loader2, Mic2, Play, Search, Sparkles, Square, Volume2 } from 'lucide-react';
import type { Voice } from '../../../types/settings';
import { useVoicePreview } from '../../../hooks/useVoicePreview';
import { useVoices } from '../../../hooks/useVoices';
import { api } from '../../../lib/api';
import { cn } from '../../../lib/utils';

/**
 * Rich per-agent voice selector for the Agents Inspector.
 * Saves voices.id into agent.voice_id — the gateway joins the voices table
 * to resolve the provider voice at call time. An empty value means
 * "use the business default" from the default agent / saved settings.
 */

const normalizeGender = (gender?: string) => {
  const value = gender?.toLowerCase() || '';
  if (value.includes('masculine') || value === 'male') return 'male';
  if (value.includes('feminine') || value === 'female') return 'female';
  return 'neutral';
};

const genderBadge = (gender: 'male' | 'female' | 'neutral') => {
  if (gender === 'male') return { label: 'Masc', className: 'bg-blue-50 text-blue-700' };
  if (gender === 'female') return { label: 'Fem', className: 'bg-rose-50 text-rose-700' };
  return { label: 'Neutral', className: 'bg-slate-100 text-slate-600' };
};

const voiceLanguage = (voice: Voice) => {
  const explicit = voice.language?.toLowerCase();
  if (explicit) return explicit.split('-')[0];
  const parts = voice.provider_voice_id?.toLowerCase().split('-') || [];
  return parts[parts.length - 1] || 'en';
};

type GenderFilter = 'all' | 'male' | 'female';

export const VoicePicker = ({
  value,
  language,
  speakingSpeed,
  onChange,
}: {
  value?: string | null;
  language: string;
  speakingSpeed: number;
  onChange: (voiceId: string | null) => void;
}) => {
  const { voices, loading } = useVoices();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const { isPlaying, isLoading: sampleLoading, playingUrl, playVoice, stopVoice } = useVoicePreview();

  const filtered = useMemo(() => {
    const base = language.toLowerCase().split('-')[0];
    const query = search.trim().toLowerCase();
    return voices.filter((voice) => {
      if (voiceLanguage(voice) !== base && voice.id !== value) return false;
      if (genderFilter !== 'all' && normalizeGender(voice.gender) !== genderFilter) return false;
      if (query) {
        const haystack = [voice.name, voice.accent, ...(voice.characteristics || [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [voices, language, value, genderFilter, search]);

  const previewUrl = (voice: Voice) =>
    api.getVoiceSampleUrl(voice.provider_voice_id, undefined, speakingSpeed);

  const togglePreview = (voice: Voice) => {
    if (!voice.provider_voice_id) return;
    const url = previewUrl(voice);
    if (isPlaying && playingUrl === url) {
      stopVoice();
    } else {
      playVoice(url);
    }
  };

  return (
    <div>
      {/* Search + gender filter */}
      <div className="mb-3 gap-2 sm:flex sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voices by name, accent, or style…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>
        <div className="mt-2 grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:mt-0 sm:w-56">
          {(['all', 'male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={cn(
                'h-8 rounded-md text-xs font-semibold transition',
                genderFilter === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {g === 'all' ? 'All' : g === 'male' ? 'Masc' : 'Fem'}
            </button>
          ))}
        </div>
      </div>

      {/* Business default option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
          !value ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            !value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
          )}
        >
          {!value ? <Check size={16} /> : <Sparkles size={16} />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">Business default voice</span>
          <span className="block text-xs text-slate-500">Follow the account-wide default</span>
        </span>
      </button>

      {/* Voice cards */}
      <div className="scrollbar-hide grid max-h-[460px] grid-cols-1 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
            <Mic2 size={20} className="mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No matching voices</p>
            <p className="mt-0.5 text-xs text-slate-400">Try another search or gender filter.</p>
          </div>
        ) : (
          filtered.map((voice) => {
            const selected = value === voice.id;
            const gender = normalizeGender(voice.gender);
            const badge = genderBadge(gender);
            const url = previewUrl(voice);
            const playing = isPlaying && playingUrl === url;
            const busy = sampleLoading && playingUrl === url;

            return (
              <div
                key={voice.id}
                role="button"
                tabIndex={0}
                onClick={() => onChange(voice.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(voice.id);
                  }
                }}
                className={cn(
                  'cursor-pointer rounded-xl border p-3 transition',
                  selected
                    ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {selected ? <Check size={18} /> : <Volume2 size={18} />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-slate-900">{voice.name}</span>
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', badge.className)}>
                        {badge.label}
                      </span>
                      {voice.is_premium && (
                        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                          <Sparkles size={9} /> Pro
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {voice.accent || voiceLanguage(voice).toUpperCase()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(voice);
                    }}
                    disabled={!voice.provider_voice_id}
                    aria-label={playing ? `Stop ${voice.name}` : `Preview ${voice.name}`}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-40',
                      playing
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                    )}
                  >
                    {busy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : playing ? (
                      <Square size={13} className="fill-current" />
                    ) : (
                      <Play size={14} className="fill-current" />
                    )}
                  </button>
                </div>

                {(voice.characteristics || []).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(voice.characteristics || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
