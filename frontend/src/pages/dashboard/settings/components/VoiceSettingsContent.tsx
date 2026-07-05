import React, { useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock,
  Gauge,
  Globe2,
  Headphones,
  Loader2,
  Mic2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  ToggleLeft,
  Volume2,
} from 'lucide-react';
import type { Voice, VoiceSettingsProps } from '../../../../types/settings';
import { useVoicePreview } from '../../../../hooks/useVoicePreview';
import { api } from '../../../../lib/api';
import { WebCallPreview } from './WebCallPreview';

const LANGUAGES = [
  { value: 'en-US', label: 'English', hint: 'US, UK, AU, IN, NZ' },
  { value: 'es', label: 'Spanish', hint: 'Spain and Latin America' },
  { value: 'fr', label: 'French', hint: 'France' },
  { value: 'de', label: 'German', hint: 'Germany' },
  { value: 'it', label: 'Italian', hint: 'Italy' },
  { value: 'nl', label: 'Dutch', hint: 'Netherlands' },
  { value: 'ja', label: 'Japanese', hint: 'Japan' },
];

const TONES = [
  { value: 'friendly', label: 'Friendly', description: 'Warm front-desk energy', Icon: Sparkles },
  { value: 'professional', label: 'Professional', description: 'Clear and composed', Icon: BriefcaseBusiness },
  { value: 'casual', label: 'Casual', description: 'Relaxed and direct', Icon: Headphones },
];

const GREETING_PREVIEW_ID = 'greeting-preview';

const normalizeGender = (gender?: string) => {
  const value = gender?.toLowerCase() || '';
  if (value.includes('masculine') || value === 'male') return 'male';
  if (value.includes('feminine') || value === 'female') return 'female';
  return 'neutral';
};

const getVoiceLanguage = (voice: Voice) => {
  const explicit = voice.language?.toLowerCase();
  if (explicit) return explicit.split('-')[0];
  const parts = voice.provider_voice_id?.toLowerCase().split('-') || [];
  return parts[parts.length - 1] || 'en';
};

const languageMatches = (voice: Voice, selectedLanguage: string) => {
  const voiceLanguage = getVoiceLanguage(voice);
  const selectedBase = selectedLanguage.toLowerCase().split('-')[0];
  if (selectedBase === 'en') return voiceLanguage === 'en';
  return voiceLanguage === selectedBase;
};

const describeGender = (gender?: string) => {
  const normalized = normalizeGender(gender);
  if (normalized === 'male') return 'Masculine';
  if (normalized === 'female') return 'Feminine';
  return 'Neutral';
};

const voiceDescription = (voice?: Voice) => {
  if (!voice) return 'Choose a voice to preview and assign.';
  const details = [describeGender(voice.gender), voice.accent, voice.age].filter(Boolean);
  return details.join(' · ');
};

export const VoiceSettingsContent: React.FC<VoiceSettingsProps> = ({
  settings,
  availableVoices,
  onChange,
  plan
}) => {
  const { isLoading, isPlaying, playVoice, stopVoice } = useVoicePreview();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [voiceSearch, setVoiceSearch] = useState('');

  const activeVoices = useMemo(
    () => availableVoices.filter((voice) => voice.is_active !== false),
    [availableVoices]
  );

  const selectedVoice = activeVoices.find((voice) => voice.id === settings.voice_id);

  const languageVoices = useMemo(
    () => activeVoices.filter((voice) => languageMatches(voice, settings.language)),
    [activeVoices, settings.language]
  );

  const visibleVoices = useMemo(() => {
    const normalizedSearch = voiceSearch.trim().toLowerCase();
    const byPlan = plan === 'starter'
      ? [
        ...languageVoices.filter((voice) => normalizeGender(voice.gender) === 'male').slice(0, 5),
        ...languageVoices.filter((voice) => normalizeGender(voice.gender) === 'female').slice(0, 5),
      ]
      : languageVoices;

    return byPlan
      .filter((voice) => genderFilter === 'all' || normalizeGender(voice.gender) === genderFilter)
      .filter((voice) => {
        if (!normalizedSearch) return true;
        const haystack = [
          voice.name,
          voice.accent,
          voice.provider_voice_id,
          voice.age,
          ...(voice.characteristics || []),
          ...(voice.use_cases || []),
        ].join(' ').toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [genderFilter, languageVoices, plan, voiceSearch]);

  const languageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    LANGUAGES.forEach((language) => {
      const base = language.value.toLowerCase().split('-')[0];
      const count = activeVoices.filter((voice) => {
        return getVoiceLanguage(voice) === base;
      }).length;
      counts.set(language.value, count);
    });
    return counts;
  }, [activeVoices]);

  const handleVoicePreview = async (voice: Voice) => {
    if (playingVoiceId === voice.id && isPlaying) {
      stopVoice();
      setPlayingVoiceId(null);
      return;
    }

    const urlToPlay = voice.provider_voice_id
      ? api.getVoiceSampleUrl(voice.provider_voice_id, undefined, settings.speaking_speed)
      : voice.sample_audio_url;

    if (!urlToPlay) {
      console.warn('No sample source available for this voice');
      return;
    }

    setPlayingVoiceId(voice.id);
    await playVoice(urlToPlay);
    setPlayingVoiceId(null);
  };

  const handleGreetingPreview = async () => {
    if (playingVoiceId === GREETING_PREVIEW_ID && isPlaying) {
      stopVoice();
      setPlayingVoiceId(null);
      return;
    }

    if (!selectedVoice?.provider_voice_id) return;

    const text = settings.custom_greeting?.trim() || 'Hi, thanks for calling. How can I help today?';
    const url = api.getVoiceSampleUrl(selectedVoice.provider_voice_id, text, settings.speaking_speed);

    setPlayingVoiceId(GREETING_PREVIEW_ID);
    await playVoice(url);
    setPlayingVoiceId(null);
  };

  const handleLanguageChange = (language: string) => {
    const defaultVoice = activeVoices.find((voice) => languageMatches(voice, language));
    onChange({
      language,
      voice_id: defaultVoice?.id || '',
      model_name: defaultVoice?.name || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] gap-6">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Mic2 className="h-4 w-4 text-cyan-600" />
                  Voice catalog
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Voices filtered by the call language.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Premium voices
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, accent, model, style"
                  value={voiceSearch}
                  onChange={(event) => setVoiceSearch(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-950 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {(['all', 'male', 'female'] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setGenderFilter(gender)}
                    className={`h-8 min-w-16 rounded-md px-3 text-xs font-semibold transition ${genderFilter === gender
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {gender === 'all' ? 'All' : gender === 'male' ? 'Masc' : 'Fem'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="scrollbar-hide grid max-h-[520px] grid-cols-1 overflow-y-auto p-3 sm:grid-cols-2 2xl:grid-cols-3">
            {visibleVoices.map((voice) => {
              const selected = settings.voice_id === voice.id;
              const loading = playingVoiceId === voice.id && isLoading;
              const playing = playingVoiceId === voice.id && isPlaying;
              const gender = normalizeGender(voice.gender);

              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onChange({ voice_id: voice.id, model_name: voice.name || '' })}
                  className={`m-1 rounded-lg border p-3 text-left transition ${selected
                    ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {selected ? <Check className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-950">{voice.name}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${gender === 'male'
                          ? 'bg-blue-50 text-blue-700'
                          : gender === 'female'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                          }`}>
                          {gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'N'}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
                        {voice.accent || getVoiceLanguage(voice).toUpperCase()}
                      </span>
                    </span>

                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleVoicePreview(voice);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          handleVoicePreview(voice);
                        }
                      }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${playing
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : playing ? (
                        <Square className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current" />
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(voice.characteristics || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}

            {visibleVoices.length === 0 && (
              <div className="col-span-full flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                <Mic2 className="mb-2 h-6 w-6 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No matching voices</p>
                <p className="mt-1 text-xs font-medium text-slate-400">Change language, search, or gender filters.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                <Volume2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">Current selection</p>
                <h3 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950">
                  {selectedVoice?.name || 'Not set'}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-600">{voiceDescription(selectedVoice)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-500">Accent</span>
                <span className="truncate text-xs font-semibold text-slate-800">{selectedVoice ? (selectedVoice.accent || describeGender(selectedVoice.gender)) : 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-500">Speed</span>
                <span className="font-semibold text-slate-800">{settings.speaking_speed.toFixed(1)}x</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGreetingPreview}
              disabled={!selectedVoice?.provider_voice_id || (playingVoiceId === GREETING_PREVIEW_ID && isLoading)}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {playingVoiceId === GREETING_PREVIEW_ID && isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : playingVoiceId === GREETING_PREVIEW_ID && isPlaying ? (
                <Square className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              {playingVoiceId === GREETING_PREVIEW_ID && isPlaying ? 'Stop preview' : 'Preview greeting'}
            </button>
            <p className="mt-2 text-center text-xs font-medium text-slate-400">
              Hear your first message in the selected voice.
            </p>
          </section>

          <WebCallPreview />

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Globe2 className="h-4 w-4 text-cyan-600" />
              Language
            </label>
            <div className="grid gap-2">
              {LANGUAGES.map((language) => {
                const active = settings.language === language.value;
                const count = languageCounts.get(language.value) || 0;

                return (
                  <button
                    key={language.value}
                    type="button"
                    onClick={() => handleLanguageChange(language.value)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${active
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-950">{language.label}</span>
                      <span className="block text-xs font-medium text-slate-500">{language.hint}</span>
                    </span>
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${active ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Gauge className="h-4 w-4 text-cyan-600" />
            Speaking speed
            <span className="ml-auto rounded-md bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">
              {settings.speaking_speed.toFixed(1)}x
            </span>
          </label>
          <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3">
            <span className="text-xs font-bold text-slate-400">0.7x</span>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={settings.speaking_speed}
              onChange={(event) => onChange({ speaking_speed: parseFloat(event.target.value) })}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-cyan-600"
            />
            <span className="text-xs font-bold text-slate-400">1.5x</span>
          </div>
          <p className="mt-3 text-xs font-medium leading-5 text-slate-400">
            1.0x is the natural default. Changes apply to live calls and voice previews.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 xl:col-span-2">
          <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Clock className="h-4 w-4 text-cyan-600" />
            Conversation tone
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {TONES.map(({ value, label, description, Icon }) => {
              const active = settings.conversation_tone === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange({ conversation_tone: value })}
                  className={`rounded-lg border p-3 text-left transition ${active
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Icon className={`h-4 w-4 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
                    {label}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">{description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Volume2 className="h-4 w-4 text-cyan-600" />
            First message
          </label>
          <textarea
            rows={4}
            placeholder="Hi, thanks for calling. How can I help today?"
            value={settings.custom_greeting}
            onChange={(event) => onChange({ custom_greeting: event.target.value })}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            {settings.custom_greeting?.length || 0}/500
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <ChevronDown className="h-4 w-4 text-cyan-600" />
            After-hours message
          </label>
          <textarea
            rows={4}
            placeholder="We are currently closed, but I can still take a message or help with scheduling."
            value={settings.after_hours_greeting}
            onChange={(event) => onChange({ after_hours_greeting: event.target.value })}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            {settings.after_hours_greeting?.length || 0}/500
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ToggleLeft className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">AI receptionist</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Incoming calls use the selected voice when this is enabled.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ is_active: !settings.is_active })}
          className={`relative h-8 w-14 rounded-full transition ${settings.is_active ? 'bg-cyan-600' : 'bg-slate-300'}`}
          aria-pressed={settings.is_active}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${settings.is_active ? 'left-7' : 'left-1'}`}
          />
        </button>
      </section>
    </div>
  );
};
