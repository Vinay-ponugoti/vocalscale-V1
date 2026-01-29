import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Activity, ShieldCheck, Timer, Languages, Smartphone, Sparkles, User, Play, Pause, Volume2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { VoiceInput } from './VoiceInput';
import { api } from '@/lib/api';

interface Voice {
  id: string;
  name: string;
  provider_voice_id: string;
  sample_audio_url: string;
  accent: string;
}

function AiReceptionistVisual() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await api.getVoices();
        // Filter to get some diversity or specific ones
        const allVoices = response.data || [];
        const featured = allVoices.filter((v: any) =>
          ['Asteria', 'Zeus', 'Orion', 'Agathe'].includes(v.name)
        ).slice(0, 3);

        // If not enough specific ones, just take the first 3
        if (featured.length < 3) {
          setVoices(allVoices.slice(0, 3));
        } else {
          setVoices(featured);
        }
      } catch (error) {
        console.error('Error fetching voices for landing page:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVoices();
  }, []);

  const handleTogglePlay = (voice: Voice) => {
    if (playingId === voice.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingId(null);
      }
      audioRef.current.src = voice.sample_audio_url;
      audioRef.current.play();
      setPlayingId(voice.id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[220px]">
      <div className="flex items-center gap-8 mb-8">
        {/* Big Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center shadow-xl shadow-blue-500/10">
            <User className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
          </div>
          {/* Status dot */}
          <div className="absolute top-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
        </div>

        {/* Voice Selection */}
        <div className="flex flex-col gap-2.5 min-w-[140px]">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-32 bg-slate-100 animate-pulse rounded-full" />
            ))
          ) : voices.length > 0 ? (
            voices.map((voice) => (
              <div
                key={voice.id}
                onClick={() => handleTogglePlay(voice)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all hover:scale-105 shadow-sm group/voice",
                  playingId === voice.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/30"
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                )}
              >
                {playingId === voice.id ? (
                  <div className="flex gap-0.5 items-center mr-0.5">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className="w-0.5 bg-white rounded-full animate-wave"
                        style={{
                          height: '8px',
                          animationDelay: `${bar * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Play className="w-3 h-3 group-hover/voice:text-blue-600 transition-colors" fill="currentColor" />
                )}
                {voice.name} ({voice.accent})
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-xs italic">Voices loading...</div>
          )}
        </div>
      </div>

      <div>
        <VoiceInput />
      </div>
    </div>
  );
}

export function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Receptionist',
      description: 'Natural, human-like conversations that handle inquiries and route calls intelligently—available 24/7.',
      className: 'md:col-span-8 md:row-span-2 bg-gradient-to-br from-blue-50/50 via-white/50 to-white/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      content: <AiReceptionistVisual />
    },
    {
      icon: Timer,
      title: 'Smart Scheduling',
      description: 'Automated booking that syncs with your calendar.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-indigo-50/50 via-white/50 to-white/50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Activity,
      title: 'Deep Analytics',
      description: 'Insights into call patterns and sentiment.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-violet-50/50 via-white/50 to-white/50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      icon: Languages,
      title: 'Global Scale',
      description: 'Speak to customers in over 50 languages. Provide a local experience, everywhere.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-tr from-cyan-50/50 via-white/50 to-white/50',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-Level Security',
      description: 'Protected with SOC 2 certified encryption.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-bl from-emerald-50/50 via-white/50 to-white/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Control',
      description: 'Manage your agent and review transcripts from any device, anywhere in the world.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-br from-amber-50/50 via-white/50 to-white/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    }
  ];

  return (
    <section id="features" className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-transparent">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-grid-slate-900/[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Capabilities</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Everything you need <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic tracking-tight">to scale.</span>
          </h2>

          <p
            className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            We've combined state-of-the-art Voice AI with business-grade tools to help you provide world-class service, 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 backdrop-blur-md p-6 md:p-8 lg:p-10 transition-all duration-500 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-white",
                feature.className
              )}
            >
              <div className="relative z-10 h-full flex flex-col">
                {feature.content ? (
                  <div className="flex-1 flex items-center justify-center mb-6">
                    {feature.content}
                  </div>
                ) : (
                  <div className={cn(
                    "w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-transform group-hover:scale-110 duration-500 bg-white border border-slate-100 shadow-sm",
                    feature.iconBg
                  )}>
                    <feature.icon className={cn("w-6 md:w-7 h-6 md:h-7", feature.iconColor)} strokeWidth={1.5} />
                  </div>
                )}

                <div className="mt-auto">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-3 md:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed group-hover:text-slate-900 transition-colors mt-0">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover highlight effect */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_80%)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
