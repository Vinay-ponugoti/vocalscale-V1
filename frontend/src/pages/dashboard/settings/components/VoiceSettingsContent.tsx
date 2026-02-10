import React, { useState } from 'react';
import { Globe, Volume2, Loader2, Mic, User, Sparkles } from 'lucide-react';
import { Label, Textarea } from '../../components/SettingsComponents';
import type { VoiceSettingsProps } from '../../../../types/settings';
import { useVoicePreview } from '../../../../hooks/useVoicePreview';
import { api } from '../../../../lib/api';

// Internal Component: Custom Toggle Switch
const CustomToggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ease-out focus:outline-none ${active ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-slate-200'
      }`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-out ${active ? 'translate-x-5' : 'translate-x-0'
        }`}
    />
  </button>
);

export const VoiceSettingsContent: React.FC<VoiceSettingsProps> = ({
  settings,
  availableVoices,
  onChange,
}) => {
  const { isLoading, isPlaying, playVoice, stopVoice } = useVoicePreview();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'Masculine' | 'Feminine'>('all');

  const handleVoicePreview = async (voiceId: string, providerVoiceId: string | null, sampleUrl: string | null) => {
    if (playingVoiceId === voiceId && isPlaying) {
      stopVoice();
      setPlayingVoiceId(null);
    } else {
      // Always prefer the proxy URL if we have a provider ID.
      // This avoids CSP issues with direct Supabase URLs and ensures we use the self-healing backend route.
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

  // State for voices (initialized from props, but updated via API for server-side filtering)
  const [displayVoices, setDisplayVoices] = useState<typeof availableVoices>(availableVoices);

  // Sync prop changes to state (e.g. initial load)
  // Ensure we map any legacy "male"/"female" values if they come from props, though props come from DB which relies on schema.
  React.useEffect(() => {
    // Only reset if we haven't manually filtered yet, or if we want to ensure we have the latest list
    if (genderFilter === 'all') {
      setDisplayVoices(availableVoices);
    }
  }, [availableVoices]);

  // Server-side filtering when gender changes
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

  // Client-side Language Filtering (still needed as backend only filters gender for now)
  const languageVoices = displayVoices.filter(voice => {
    // Check if voice is enabled first
    if (voice.is_active === false) return false;

    // If voice has an explicit accent/language field that matches
    const selectedLangBase = settings.language.toLowerCase().split('-')[0];
    if (voice.accent && voice.accent.toLowerCase().includes(selectedLangBase)) {
      return true;
    }

    // Fallback to provider_voice_id pattern matching
    const providerVoiceId = voice.provider_voice_id?.toLowerCase() || '';
    return providerVoiceId.includes('-' + selectedLangBase) ||
      providerVoiceId.startsWith('aura-2-' + selectedLangBase) ||
      providerVoiceId.includes(selectedLangBase);
  });

  // Handle language change - automatically select default ACTIVE voice for that language
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    const selectedLangBase = newLanguage.toLowerCase().split('-')[0];

    // Find first active voice for new language
    const defaultVoiceForLanguage = availableVoices.find(voice => {
      if (voice.is_active === false) return false;
      const providerVoiceId = voice.provider_voice_id?.toLowerCase() || '';
      return providerVoiceId.startsWith('aura-2-' + selectedLangBase) ||
        providerVoiceId.includes('-' + selectedLangBase);
    });

    // Update both language and voice_id (use database ID)
    onChange({
      language: newLanguage,
      voice_id: defaultVoiceForLanguage?.id || '',
      model_name: defaultVoiceForLanguage?.name || ''
    });
  };

  return (
    <div className="space-y-10 2xl:space-y-14">

      {/* SECTION: Voice & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-10">

        {/* Voice Persona - Modern Grid Layout */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <Label className="block text-[12px] font-black uppercase tracking-[0.12em] text-slate-800">
                  Voice Persona
                </Label>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Choose how your AI receptionist sounds</p>
              </div>
            </div>
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-sm">
              {[
                { label: 'All', value: 'all', icon: <Sparkles className="w-3 h-3" /> },
                { label: 'Masculine', value: 'Masculine', icon: null },
                { label: 'Feminine', value: 'Feminine', icon: null }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGenderFilter(option.value as 'all' | 'Masculine' | 'Feminine')}
                  className={`
                    px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5
                    ${genderFilter === option.value
                      ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 border border-slate-200/60'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {languageVoices.map(voice => {
              const isSelected = settings.voice_id === voice.id;
              const isVoicePlaying = playingVoiceId === voice.id && isPlaying;
              const isVoiceLoading = playingVoiceId === voice.id && isLoading;

              // Generate a consistent gradient based on voice name
              const gradients = [
                'from-violet-500 to-purple-600',
                'from-blue-500 to-indigo-600',
                'from-emerald-500 to-teal-600',
                'from-rose-500 to-pink-600',
                'from-amber-500 to-orange-600',
                'from-cyan-500 to-blue-600',
                'from-fuchsia-500 to-purple-600',
                'from-lime-500 to-emerald-600',
              ];
              const gradientIndex = voice.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;
              const gradient = gradients[gradientIndex];

              return (
                <div
                  key={voice.id}
                  className={`
                    relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group
                    ${isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-lg shadow-indigo-100/60 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/60'
                    }
                  `}
                  onClick={() => {
                    onChange({
                      voice_id: voice.id,
                      model_name: voice.name || ''
                    });
                  }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`
                      w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg
                      ${isSelected ? 'shadow-indigo-200/60' : 'shadow-slate-200/40'}
                      transition-all duration-300 group-hover:scale-105
                    `}>
                      <User className="w-5 h-5 text-white/90" />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 border-2 border-white">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    {isVoicePlaying && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-md border-2 border-white">
                        <div className="flex gap-[2px] items-end h-2.5">
                          <div className="w-[2px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '6px', animationDelay: '0ms' }} />
                          <div className="w-[2px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '10px', animationDelay: '150ms' }} />
                          <div className="w-[2px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '4px', animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[13px] font-extrabold tracking-tight truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {voice.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`
                        inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                        ${voice.gender === 'male' || voice.gender === 'Masculine'
                          ? 'bg-blue-50 text-blue-500 border border-blue-100'
                          : 'bg-pink-50 text-pink-500 border border-pink-100'
                        }
                      `}>
                        {voice.gender === 'male' ? 'M' : voice.gender === 'female' ? 'F' : voice.gender?.charAt(0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">
                        {voice.accent}
                      </span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id, voice.provider_voice_id || null, voice.sample_audio_url || null);
                    }}
                    className={`
                      shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                      ${isVoicePlaying
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/60 scale-105'
                        : isSelected
                          ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 group-hover:bg-slate-100'
                      }
                    `}
                    disabled={isVoiceLoading}
                  >
                    {isVoiceLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isVoicePlaying ? (
                      <div className="flex gap-[2px] items-end h-3.5">
                        <div className="w-[2.5px] bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '8px', animationDelay: '0ms' }} />
                        <div className="w-[2.5px] bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '14px', animationDelay: '120ms' }} />
                        <div className="w-[2.5px] bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" style={{ height: '6px', animationDelay: '240ms' }} />
                      </div>
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {languageVoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                <Mic className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">No voices available</p>
              <p className="text-xs text-slate-300 mt-1">Try selecting a different language or filter</p>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
            Language
          </Label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-900 text-[13px] font-bold py-3 pl-10 pr-10 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all cursor-pointer hover:border-slate-200 shadow-sm"
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
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Speaking Speed */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">
            Speaking Speed
          </Label>
          <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            {settings.speaking_speed}x
          </span>
        </div>

        <div className="relative w-full h-6 flex items-center group">
          <div className="absolute w-full h-1.5 bg-slate-100 rounded-full" />
          <div
            className="absolute h-1.5 bg-indigo-600 rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${((settings.speaking_speed - 0.5) / 1.5) * 100}%` }}
          />
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speaking_speed}
            onChange={(e) => onChange({ speaking_speed: parseFloat(e.target.value) })}
            className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>

        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>

      {/* SECTION: Conversation Tone */}
      <div className="space-y-4">
        <Label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">
          Conversation Tone
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {['friendly', 'professional', 'casual'].map((tone) => {
            const isActive = settings.conversation_tone === tone;
            return (
              <button
                key={tone}
                onClick={() => onChange({ conversation_tone: tone })}
                className={`
                  relative py-4 px-4 font-black text-[11px] uppercase tracking-widest transition-all duration-300
                  rounded-xl border flex items-center justify-center gap-2 group
                  ${isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'
                  }
                `}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: Custom Greeting */}
      <div className="space-y-3">
        <Label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">
          Custom Greeting
        </Label>
        <div className="relative group">
          <Textarea
            rows={4}
            placeholder="Hi! Thanks for calling [Business Name]. How can I help you today?"
            value={settings.custom_greeting}
            onChange={(e) => onChange({ custom_greeting: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-none font-medium text-[13px] leading-relaxed shadow-sm"
          />
        </div>
      </div>

      {/* SECTION: System Toggle */}
      <div className="pt-8 border-t border-slate-50">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all duration-300 hover:bg-white hover:border-indigo-100">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Enable AI Receptionist
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">
              Allow the AI to autonomously handle incoming calls.
            </span>
          </div>
          <CustomToggle
            active={settings.is_active}
            onChange={() => onChange({ is_active: !settings.is_active })}
          />
        </div>
      </div>

    </div>
  );
};