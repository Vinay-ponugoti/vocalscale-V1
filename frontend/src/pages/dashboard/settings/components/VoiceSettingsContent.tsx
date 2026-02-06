import React, { useState } from 'react';
import { Globe, Volume2, Loader2 } from 'lucide-react';
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

        {/* Voice Persona - Grid Layout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">
              Voice Persona
            </Label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-sm shrink-0">
              {[
                { label: 'All', value: 'all' },
                { label: 'Masculine', value: 'Masculine' },
                { label: 'Feminine', value: 'Feminine' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGenderFilter(option.value as 'all' | 'Masculine' | 'Feminine')}
                  className={`
                    px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all
                    ${genderFilter === option.value
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {languageVoices.map(voice => {
              const isSelected = settings.voice_id === voice.id;
              const isVoicePlaying = playingVoiceId === voice.id && isPlaying;
              const isVoiceLoading = playingVoiceId === voice.id && isLoading;

              return (
                <div
                  key={voice.id}
                  className={`
                    relative flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group
                    ${isSelected
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                    }
                  `}
                  onClick={() => {
                    onChange({
                      voice_id: voice.id,
                      model_name: voice.name || ''
                    });
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12px] font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {voice.name}
                      </span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 truncate block">
                      {voice.gender === 'male' ? 'Masculine' : voice.gender === 'female' ? 'Feminine' : voice.gender} • {voice.accent}
                    </span>
                  </div>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoicePreview(voice.id, voice.provider_voice_id || null, voice.sample_audio_url || null);
                    }}
                    className={`
                      flex items-center justify-center w-7 h-7 rounded-lg transition-all shrink-0 ml-2
                      ${isVoicePlaying
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                      }
                    `}
                    disabled={isVoiceLoading}
                  >
                    {isVoiceLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Volume2 className={`w-3.5 h-3.5 ${isVoicePlaying ? 'animate-pulse' : ''}`} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
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