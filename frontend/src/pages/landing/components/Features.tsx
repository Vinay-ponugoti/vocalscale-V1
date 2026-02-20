import React, { useState, useRef } from 'react';
import { BrainCircuit, Activity, ShieldCheck, Timer, Languages, Smartphone, Sparkles, Play, Pause, PhoneCall, Bot, MessageSquare, Headphones } from 'lucide-react';

import { cn } from '@/lib/utils';

// Pre-compute random animation durations outside of render
const BAR_DURATIONS = Array.from({ length: 32 }).map((_, i) => ({
  delay: `${i * 0.05}s`,
  duration: `${0.6 + (i % 5) * 0.2}s`  // Use deterministic pattern instead of Math.random
}));

interface Voice {
  id: string;
  name: string;
  provider_voice_id: string;
  sample_audio_url: string;
  accent: string;
}

const VOICES: Voice[] = [
  { id: '1', name: 'Asteria', accent: 'US - Professional', provider_voice_id: 'asteria', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-asteria-en.mp3' },
  { id: '2', name: 'Zeus', accent: 'US - Energetic', provider_voice_id: 'zeus', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-zeus-en.mp3' },
  { id: '3', name: 'Janus', accent: 'UK - Sophisticated', provider_voice_id: 'janus', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-janus-en.mp3' },
  { id: '4', name: 'Arcas', accent: 'Filipino - Friendly', provider_voice_id: 'arcas', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-arcas-en.mp3' },
  { id: '5', name: 'Agathe', accent: 'French - Elegant', provider_voice_id: 'agathe', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-agathe-fr.mp3' },
  { id: '6', name: 'Orion', accent: 'US - Calm', provider_voice_id: 'orion', sample_audio_url: 'https://pub-9dafe3dccf8841b8811d008bbb1d80ce.r2.dev/aura-2-orion-en.mp3' },
];

function AiReceptionistVisual() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setPlayingId(voice.id);
    }
  };

  return (
    <div className="relative w-full py-8 md:py-12 flex flex-col items-center">

      {/* Sleek Inline List of Voices */}
      <div className="w-full max-w-lg space-y-3">
        {VOICES.map((voice) => {
          const isPlaying = playingId === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => handleTogglePlay(voice)}
              className={cn(
                "w-full relative px-5 py-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group overflow-hidden text-left",
                isPlaying
                  ? "bg-slate-50 border-slate-300 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                {/* Play/Pause Button */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border",
                  isPlaying
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white border-slate-200 text-slate-700 group-hover:border-slate-300 group-hover:text-slate-900"
                )}>
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-1" fill="currentColor" />}
                </div>

                {/* Voice Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-base">{voice.name}</span>

                    {/* Inline Waveform when playing */}
                    {isPlaying && (
                      <div className="flex items-end h-4 gap-[2px] ml-1">
                        {BAR_DURATIONS.slice(0, 5).map((timing, i) => (
                          <div
                            key={i}
                            className="w-[3px] rounded-full bg-slate-900 animate-sound-bar-alt"
                            style={{
                              animationDelay: timing.delay,
                              animationDuration: timing.duration,
                              height: '100%',
                              transformOrigin: 'bottom'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-0.5">
                    {voice.accent}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="relative z-10 flex items-center">
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-colors duration-300",
                  isPlaying
                    ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                    : "bg-transparent border-transparent text-slate-400 group-hover:text-slate-600"
                )}>
                  {isPlaying ? "Playing" : "Preview"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: 'Advanced AI Receptionist',
      description: 'Our AI receptionist utilizes Deepgram Aura-2 technology to provide human-like conversations with 40+ high-fidelity voices. It handles calls with ultra-low latency, ensuring a natural flow that mimics human interaction perfectly. The system is capable of understanding complex queries, managing interruptions, and maintaining context throughout the conversation.',
      className: 'md:col-span-8 md:row-span-2 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
      content: <AiReceptionistVisual />
    },
    {
      icon: Timer,
      title: 'Smart Scheduling & Calendar Sync',
      description: 'Automate your entire booking process with intelligent calendar integration. Our system syncs in real-time with Google Calendar, Outlook, and other major platforms to prevent double bookings. It can negotiate times, handle rescheduling requests, and send automated confirmations to both parties.',
      className: 'md:col-span-4 md:row-span-1 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
    },
    {
      icon: Activity,
      title: 'Deep Analytics & Insights',
      description: 'Gain valuable business intelligence from every call. Our analytics engine tracks call volume, duration, peak times, and customer sentiment. Get detailed reports on common customer queries, resolution rates, and agent performance metrics to optimize your operations.',
      className: 'md:col-span-4 md:row-span-1 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
    },
    {
      icon: Languages,
      title: 'Global Language Support',
      description: 'Break down language barriers with support for over 50 languages and dialects. Our AI automatically detects the caller\'s language and switches instantly to provide a native-like experience. Perfect for businesses serving diverse communities or operating internationally.',
      className: 'md:col-span-4 md:row-span-2 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise-Grade Security',
      description: 'Rest easy knowing your data is protected by bank-level security. We are fully PCI DSS compliant and utilize end-to-end encryption for all calls and data storage. Our infrastructure includes automated backups, role-based access control, and comprehensive audit logs.',
      className: 'md:col-span-4 md:row-span-2 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
    },
    {
      icon: Smartphone,
      title: 'Mobile Control Center',
      description: 'Take full control of your AI agent from anywhere. Our mobile-responsive dashboard allows you to monitor live calls, review transcripts, update scripts, and manage settings on the go. Receive instant notifications for urgent matters or missed opportunities.',
      className: 'md:col-span-4 md:row-span-2 bg-white',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800',
    }
  ];

  const additionalFeatures = [
    {
      icon: Bot,
      title: 'Custom Knowledge Base',
      description: 'Train your AI on your specific business data. Upload FAQs, pricing sheets, and policy documents to create a knowledgeable agent that represents your brand accurately.',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800'
    },
    {
      icon: PhoneCall,
      title: 'Call Transfer & Routing',
      description: 'Intelligent routing ensures calls reach the right department. The AI can warm transfer calls to human agents when complex issues arise or specific expertise is needed.',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800'
    },
    {
      icon: MessageSquare,
      title: 'SMS Follow-up',
      description: 'Automatically send text messages after calls with booking confirmations, links to resources, or satisfaction surveys to keep customers engaged.',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800'
    },
    {
      icon: Headphones,
      title: 'Call Recording & Transcription',
      description: 'Every call is recorded and transcribed in real-time with speaker diarization. Searchable transcripts make it easy to review conversations and extract key information.',
      iconBg: 'bg-slate-50 border border-slate-100',
      iconColor: 'text-slate-800'
    }
  ];

  return (
    <section id="features" className="py-16 md:py-32 px-6 md:px-8 relative overflow-hidden bg-transparent">
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
            <span className="text-slate-900 italic tracking-tight">to scale.</span>
          </h2>

          <p
            className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            We've combined state-of-the-art Voice AI with business-grade tools to help you provide world-class service, 24/7.
            Our comprehensive platform includes everything from intelligent call routing to detailed analytics, designed to help your business grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 lg:p-10 transition-all duration-500 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50",
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

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 shadow-sm"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                feature.iconBg
              )}>
                <feature.icon className={cn("w-5 h-5", feature.iconColor)} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
