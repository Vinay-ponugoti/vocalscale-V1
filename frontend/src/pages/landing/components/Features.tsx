import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Activity, ShieldCheck, Timer, Languages, Smartphone, Sparkles, User, Play, Pause, Volume2, Network, BarChart, Lock, Globe2, PhoneCall, Bot, Zap, MessageSquare, Headphones } from 'lucide-react';

import { cn } from '@/lib/utils';

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
      {/* Central AI Core */}
      <div className="relative mb-10 md:mb-14">
        <div className={cn(
          "w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-1000 bg-white border border-slate-200 shadow-xl",
          playingId && "animate-glow-pulse"
        )}>
          <div className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-700",
            playingId
              ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/40"
              : "bg-gradient-to-br from-blue-50 to-white text-blue-600 shadow-inner"
          )}>
            <BrainCircuit className={cn("w-10 h-10 md:w-12 md:h-12 transition-transform duration-700", playingId && "scale-110")} strokeWidth={1.5} />
          </div>
        </div>

        {/* Orbiting Elements */}
        {playingId && (
          <>
            <div className="absolute inset-0 -m-4 border border-blue-200/50 rounded-full animate-spin [animation-duration:8s] opacity-60" />
            <div className="absolute inset-0 -m-8 border border-blue-100/30 rounded-full animate-spin [animation-duration:12s] [animation-direction:reverse] opacity-40" />
          </>
        )}
      </div>

      {/* Premium Visualizer */}
      <div className="h-20 flex items-center justify-center gap-[3px] mb-12 px-6 w-full max-w-[380px]">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-300",
              playingId
                ? "bg-blue-600 animate-sound-bar-alt"
                : "h-1.5 bg-slate-200 opacity-50"
            )}
            style={{
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.6 + Math.random() * 0.8}s`
            }}
          />
        ))}
      </div>

      {/* Premium Voice Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleTogglePlay(voice)}
            className={cn(
              "relative px-4 py-4 rounded-3xl border transition-all duration-500 flex flex-col items-start gap-1 text-left group overflow-hidden",
              playingId === voice.id
                ? "bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/30 -translate-y-1 scale-[1.02]"
                : "bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-white hover:shadow-xl hover:-translate-y-1 active:scale-95 shadow-sm"
            )}
          >
            <div className="flex items-center gap-2.5 w-full relative z-10">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                playingId === voice.id
                  ? "bg-white text-blue-600"
                  : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              )}>
                {playingId === voice.id ? <Pause size={12} fill="currentColor" /> : <Play size={12} className="ml-0.5" fill="currentColor" />}
              </div>
              <span className="font-bold text-sm leading-none">{voice.name}</span>
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.15em] relative z-10",
              playingId === voice.id ? "text-blue-100" : "text-slate-500 group-hover:text-blue-600"
            )}>
              {voice.accent}
            </span>

            {/* Hover visual effects */}
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-[0.03] transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-500" />
            <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100" />
          </button>
        ))}
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
      className: 'md:col-span-8 md:row-span-2 bg-gradient-to-br from-blue-50/50 via-white/50 to-white/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      content: <AiReceptionistVisual />
    },
    {
      icon: Timer,
      title: 'Smart Scheduling & Calendar Sync',
      description: 'Automate your entire booking process with intelligent calendar integration. Our system syncs in real-time with Google Calendar, Outlook, and other major platforms to prevent double bookings. It can negotiate times, handle rescheduling requests, and send automated confirmations to both parties.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-indigo-50/50 via-white/50 to-white/50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Activity,
      title: 'Deep Analytics & Insights',
      description: 'Gain valuable business intelligence from every call. Our analytics engine tracks call volume, duration, peak times, and customer sentiment. Get detailed reports on common customer queries, resolution rates, and agent performance metrics to optimize your operations.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-violet-50/50 via-white/50 to-white/50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      icon: Languages,
      title: 'Global Language Support',
      description: 'Break down language barriers with support for over 50 languages and dialects. Our AI automatically detects the caller\'s language and switches instantly to provide a native-like experience. Perfect for businesses serving diverse communities or operating internationally.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-tr from-cyan-50/50 via-white/50 to-white/50',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise-Grade Security',
      description: 'Rest easy knowing your data is protected by bank-level security. We are fully PCI DSS compliant and utilize end-to-end encryption for all calls and data storage. Our infrastructure includes automated backups, role-based access control, and comprehensive audit logs.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-bl from-emerald-50/50 via-white/50 to-white/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Control Center',
      description: 'Take full control of your AI agent from anywhere. Our mobile-responsive dashboard allows you to monitor live calls, review transcripts, update scripts, and manage settings on the go. Receive instant notifications for urgent matters or missed opportunities.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-br from-amber-50/50 via-white/50 to-white/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    }
  ];

  const additionalFeatures = [
    {
      icon: Bot,
      title: 'Custom Knowledge Base',
      description: 'Train your AI on your specific business data. Upload FAQs, pricing sheets, and policy documents to create a knowledgeable agent that represents your brand accurately.',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600'
    },
    {
      icon: PhoneCall,
      title: 'Call Transfer & Routing',
      description: 'Intelligent routing ensures calls reach the right department. The AI can warm transfer calls to human agents when complex issues arise or specific expertise is needed.',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      icon: MessageSquare,
      title: 'SMS Follow-up',
      description: 'Automatically send text messages after calls with booking confirmations, links to resources, or satisfaction surveys to keep customers engaged.',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600'
    },
    {
      icon: Headphones,
      title: 'Call Recording & Transcription',
      description: 'Every call is recorded and transcribed in real-time with speaker diarization. Searchable transcripts make it easy to review conversations and extract key information.',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic tracking-tight">to scale.</span>
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

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
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
