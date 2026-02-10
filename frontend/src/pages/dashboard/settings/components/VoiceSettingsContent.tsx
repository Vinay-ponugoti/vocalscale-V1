import React, { useState } from 'react';
import { Globe, Volume2, Loader2, Mic, Play, Square, Search, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import type { VoiceSettingsProps } from '../../../../types/settings';
import { useVoicePreview } from '../../../../hooks/useVoicePreview';
import { api } from '../../../../lib/api';

export const VoiceSettingsContent: React.FC<VoiceSettingsProps> = ({
  settings,
  availableVoices,
  onChange,
}) => {
  const { isLoading, isPlaying, playVoice, stopVoice } = useVoicePreview();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'Masculine' | 'Feminine'>('all');
  const [voiceSearch, setVoiceSearch] = useState('');

  const handleVoicePreview = async (voiceId: string, providerVoiceId: string | null, sampleUrl: string | null) => {
    if (playingVoiceId === voiceId && isPlaying) {
      stopVoice();
      setPlayingVoiceId(null);
    } else {
      const urlToPlay = providerVoiceId ? api.getVoiceSampleUrl(providerVoiceId) : sampleUrl;
      if (!urlToPlay) {
        console.warn('No sample source available for this voice');
        return;
      }
      setPlayingVoiceId(voiceId);
      await playVoice(urlToPlay);
      setPlayingVoiceId(null);
    }
  };

  const [displayVoices, setDisplayVoices] = useState<typeof availableVoices>(availableVoices);

  React.useEffect(() => {
    if (genderFilter === 'all') {
      setDisplayVoices(availableVoices);
    }
  }, [availableVoices]);

  React.useEffect(() => {
    const fetchFilteredVoices = async () => {
      try {
        const response = await api.getVoices({ gender: genderFilter });
        if (response.data) {
          setDisplayVoices(response.data);
        }
      } catch (error) {
        console.error('Failed to filter voices:', error);
      }
    };
    fetchFilteredVoices();
  }, [genderFilter]);

  const languageVoices = displayVoices.filter(voice => {
    if (voice.is_active === false) return false;
    const selectedLangBase = settings.language.toLowerCase().split('-')[0];
    if (voice.accent && voice.accent.toLowerCase().includes(selectedLangBase)) return true;
    const providerVoiceId = voice.provider_voice_id?.toLowerCase() || '';
    return providerVoiceId.includes('-' + selectedLangBase) ||
      providerVoiceId.startsWith('aura-2-' + selectedLangBase) ||
      providerVoiceId.includes(selectedLangBase);
  });

  const filteredVoices = languageVoices.filter(voice => {
    if (!voiceSearch) return true;
    const q = voiceSearch.toLowerCase();
    return voice.name?.toLowerCase().includes(q) || voice.accent?.toLowerCase().includes(q);
  });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    const selectedLangBase = newLanguage.toLowerCase().split('-')[0];
    const defaultVoiceForLanguage = availableVoices.find(voice => {
      if (voice.is_active === false) return false;
      const providerVoiceId = voice.provider_voice_id?.toLowerCase() || '';
      return providerVoiceId.startsWith('aura-2-' + selectedLangBase) ||
        providerVoiceId.includes('-' + selectedLangBase);
    });
    onChange({
      language: newLanguage,
      voice_id: defaultVoiceForLanguage?.id || '',
      model_name: defaultVoiceForLanguage?.name || ''
    });
  };

  const selectedVoice = availableVoices.find(v => v.id === settings.voice_id);

  const toneConfig = [
    { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable', icon: '😊' },
    { value: 'professional', label: 'Professional', desc: 'Formal and polished', icon: '💼' },
    { value: 'casual', label: 'Casual', desc: 'Relaxed and natural', icon: '🎯' }
  ];

  return (
    <div className="space-y-0">

      {/* ── Section 1: Voice Provider ── */}
      <div className="pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-semibold text-slate-900">Voice</span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] text-slate-400 font-medium">Select your AI assistant's voice</span>
        </div>

        {/* Currently selected voice banner */}
        {selectedVoice && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{selectedVoice.name}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                {selectedVoice.gender === 'Masculine' || selectedVoice.gender === 'male' ? 'Male' : 'Female'} · {selectedVoice.accent || 'English'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleVoicePreview(selectedVoice.id, selectedVoice.provider_voice_id || null, selectedVoice.sample_audio_url || null)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {playingVoiceId === selectedVoice.id && isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : playingVoiceId === selectedVoice.id && isPlaying ? (
                <Square className="w-3 h-3 text-white fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              )}
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search voices..."
              value={voiceSearch}
              onChange={(e) => setVoiceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(['all', 'Masculine', 'Feminine'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                  genderFilter === g
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {g === 'all' ? 'All' : g}
              </button>
            ))}
          </div>
        </div>

        {/* Voice list */}
        <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 voice-list-scroll">
            {filteredVoices.map(voice => {
              const isSelected = settings.voice_id === voice.id;
              const isVoicePlaying = playingVoiceId === voice.id && isPlaying;
              const isVoiceLoading = playingVoiceId === voice.id && isLoading;

              return (
                <div
                  key={voice.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-indigo-50/80'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onChange({ voice_id: voice.id, model_name: voice.name || '' });
                  }}
                >
                  {/* Radio indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </div>

                  {/* Voice info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {voice.name}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        voice.gender === 'male' || voice.gender === 'Masculine'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-pink-50 text-pink-600'
                      }`}>
                        {voice.gender === 'male' || voice.gender === 'Masculine' ? 'M' : 'F'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{voice.accent}</span>
                  </div>

                  {/* Play button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id, voice.provider_voice_id || null, voice.sample_audio_url || null);
                    }}
                    disabled={isVoiceLoading}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                      isVoicePlaying
                        ? 'bg-indigo-600 text-white'
                        : 'bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {isVoiceLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isVoicePlaying ? (
                      <div className="flex gap-[3px] items-end h-3.5">
                        <div className="w-[2.5px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '6px' }} />
                        <div className="w-[2.5px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '14px', animationDelay: '150ms' }} />
                        <div className="w-[2.5px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '8px', animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
              );
            })}

            {filteredVoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Mic className="w-5 h-5 text-slate-300 mb-2" />
                <p className="text-[13px] text-slate-400 font-medium">No voices found</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Try a different filter or language</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-200" />

      {/* ── Section 2: Language & Speed row ── */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language */}
        <div>
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 mb-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            Language
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] font-medium py-2.5 pl-3 pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer hover:border-slate-300"
              value={settings.language}
              onChange={handleLanguageChange}
            >
              <optgroup label="English">
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="en-AU">English (Australia)</option>
                <option value="en-NZ">English (New Zealand)</option>
                <option value="en-IN">English (India)</option>
              </optgroup>
              <optgroup label="European">
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="nl">Dutch</option>
              </optgroup>
              <optgroup label="Asian">
                <option value="ja">Japanese</option>
              </optgroup>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Speaking Speed */}
        <div>
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 mb-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Speaking Speed
            <span className="ml-auto text-[12px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {settings.speaking_speed}x
            </span>
          </label>
          <div className="relative w-full h-10 flex items-center bg-white border border-slate-200 rounded-lg px-3">
            <span className="text-[10px] text-slate-400 font-medium mr-2 flex-shrink-0">0.5x</span>
            <div className="relative flex-1 h-6 flex items-center">
              <div className="absolute w-full h-1 bg-slate-200 rounded-full" />
              <div
                className="absolute h-1 bg-indigo-500 rounded-full pointer-events-none transition-all"
                style={{ width: `${((settings.speaking_speed - 0.5) / 1.5) * 100}%` }}
              />
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speaking_speed}
                onChange={(e) => onChange({ speaking_speed: parseFloat(e.target.value) })}
                className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium ml-2 flex-shrink-0">2.0x</span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-200" />

      {/* ── Section 3: Conversation Tone ── */}
      <div className="py-6">
        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          Conversation Tone
        </label>
        <div className="grid grid-cols-3 gap-2">
          {toneConfig.map((tone) => {
            const isActive = settings.conversation_tone === tone.value;
            return (
              <button
                key={tone.value}
                onClick={() => onChange({ conversation_tone: tone.value })}
                className={`relative py-3.5 px-3 rounded-xl border transition-all text-left group ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/25'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{tone.icon}</span>
                  <span className={`text-[13px] font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {tone.label}
                  </span>
                </div>
                <p className={`text-[11px] font-medium ${isActive ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                  {tone.desc}
                </p>
                {/* Active dot */}
                {isActive && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-200" />

      {/* ── Section 4: First Message ── */}
      <div className="py-6">
        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 mb-1">
          First Message
        </label>
        <p className="text-[11px] text-slate-400 font-medium mb-3">
          The greeting your AI assistant says when answering a call
        </p>
        <textarea
          rows={3}
          placeholder="Hi! Thanks for calling [Business Name]. How can I help you today?"
          value={settings.custom_greeting}
          onChange={(e) => onChange({ custom_greeting: e.target.value })}
          className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none font-medium text-[13px] leading-relaxed hover:border-slate-300"
        />
        <div className="flex items-center justify-end mt-1.5">
          <span className="text-[11px] text-slate-400 font-medium">
            {settings.custom_greeting?.length || 0} characters
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-200" />

      {/* ── Section 5: Status Toggle ── */}
      <div className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-semibold text-slate-900">Enable AI Receptionist</span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Allow the AI to autonomously handle incoming calls
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ is_active: !settings.is_active })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              settings.is_active ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                settings.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <style>{`
        .voice-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .voice-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .voice-list-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .voice-list-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};