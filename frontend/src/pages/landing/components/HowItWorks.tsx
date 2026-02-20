import { Sparkles, Puzzle, Phone, Zap, Headphones, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Only run speaking animation when section is visible
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        interval = setInterval(() => {
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 2000);
        }, 4000);
      } else {
        if (interval) clearInterval(interval);
        interval = null;
        setIsSpeaking(false);
      }
    });

    observer.observe(section);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Design Your Agent',
      description: 'Configure your AI\'s personality, knowledge base, and conversation flows. Match your brand voice perfectly.',
      icon: Zap,
      color: 'blue',
      features: ['Custom Personality', 'Knowledge Base', 'Brand Voice']
    },
    {
      number: '02',
      title: 'Connect Your Stack',
      description: 'Integrate with your phone system, calendar, and CRM in one click. Works with 50+ tools out of the box.',
      icon: Puzzle,
      color: 'indigo',
      features: ['VoIP Ready', 'Two-Way Sync', 'API Access']
    },
    {
      number: '03',
      title: 'Answer Every Call',
      description: 'Your AI agent picks up instantly, handles complex conversations, and books appointments while you focus on growth.',
      icon: Phone,
      color: 'violet',
      features: ['24/7 Uptime', 'Smart Routing', 'Live Transcripts']
    }
  ];

  return (
    <section ref={sectionRef} id="how-it-works" className="py-12 md:py-20 px-6 md:px-8 relative overflow-hidden bg-transparent">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 bg-grid-slate-900/[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />


      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm hover:shadow-md transition-shadow">
            <Sparkles className="h-4 w-4 text-blue-600 fill-blue-600/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">How It Works</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]">
            Your voice, <br />
            <span className="text-slate-900 italic tracking-tight">supercharged by AI.</span>
          </h2>

          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Deploy an intelligent voice agent that represents your brand. Handle calls, book meetings, and qualify leads around the clock.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-24 md:mb-40">
          {steps.map((step, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveStep(index)}
              className={cn(
                "group relative flex flex-col p-6 md:p-10 bg-white border rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 cursor-pointer",
                activeStep === index
                  ? "border-blue-400 shadow-2xl shadow-blue-500/10 scale-[1.02]"
                  : "border-slate-200 shadow-sm hover:border-blue-300"
              )}
            >
              {/* Active indicator */}
              <div className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-slate-800 rounded-full transition-all duration-500",
                activeStep === index ? "opacity-100" : "opacity-0"
              )} />

              <div className="flex justify-between items-start mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white border shadow-sm",
                  activeStep === index ? "border-blue-200 shadow-blue-500/20 scale-110" : "border-slate-100"
                )}>
                  <step.icon className={cn(
                    "w-7 h-7 transition-colors duration-500",
                    activeStep === index ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"
                  )} strokeWidth={1.5} />
                </div>
                <span className={cn(
                  "text-4xl italic font-black tracking-tighter transition-colors duration-500",
                  activeStep === index ? "text-blue-100" : "text-slate-100 group-hover:text-blue-50"
                )}>
                  {step.number}
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
                {step.title}
              </h3>
              <p className="text-slate-600 font-medium text-[15px] leading-relaxed mb-6 group-hover:text-slate-900 transition-colors">
                {step.description}
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {step.features.map((feature) => (
                  <span
                    key={feature}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-300",
                      activeStep === index
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-50 text-slate-500 border border-slate-100"
                    )}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live Demo Section - Voice AI Showcase */}
        <div className="relative p-1 md:p-2 bg-slate-100 border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-slate-50/50 animate-pulse" />

          <div className="relative bg-white rounded-[2.8rem] p-8 md:p-16 overflow-hidden border border-slate-100">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                  <div className={cn(
                    "absolute inset-0 bg-white/20 transition-opacity duration-300",
                    isSpeaking ? "opacity-100" : "opacity-0"
                  )} />
                  <Headphones className="w-7 h-7 text-white relative z-10" />

                  {/* Voice wave animation */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 items-end h-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-0.5 bg-white/60 rounded-full transition-all duration-300",
                          isSpeaking ? "animate-pulse" : "h-1"
                        )}
                        style={{
                          height: isSpeaking ? `${[10, 16, 8, 14, 12][i]}px` : '4px',
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-3xl sm:text-5xl leading-[1.1] md:leading-[1.05] tracking-tight mb-4 md:mb-6 text-slate-900">
                  Hear it in <br />
                  <span className="text-blue-600 italic underline decoration-blue-200 decoration-2 md:decoration-4 underline-offset-8 tracking-tight">action.</span>
                </h3>

                <p className="text-slate-600 font-medium leading-relaxed mb-6 md:mb-8 text-base md:text-lg">
                  Experience how our AI handles real conversations—with natural pauses, empathy, and perfect recall of your business details.
                </p>

                <div className="flex flex-wrap gap-3">
                  {['Human-Like Latency', 'Context Awareness', 'Instant Booking'].map((tag) => (
                    <span key={tag} className="px-5 py-2 bg-slate-50 border border-slate-200 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Chat Demo */}
              <div className="space-y-4 relative">
                {/* Live indicator */}
                <div className="absolute -top-8 right-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Demo
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 text-white shadow-lg relative overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 bg-white/20",
                      isSpeaking && "animate-pulse"
                    )} />
                    AI
                  </div>
                  <div className="bg-blue-600 text-white rounded-[2rem] rounded-tl-none p-5 text-sm font-medium leading-relaxed shadow-lg shadow-blue-500/20 relative">
                    "Good afternoon! This is Sarah from Bright Dental. I see you're looking to schedule a cleaning. Do you prefer morning or afternoon appointments?"
                    {/* Voice wave overlay */}
                    <div className="absolute bottom-2 right-4 flex gap-0.5 items-end h-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-0.5 bg-white/40 rounded-full transition-all duration-200",
                            isSpeaking ? "animate-pulse" : "h-1"
                          )}
                          style={{
                            height: isSpeaking ? `${[6, 10, 4][i]}px` : '4px',
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start justify-end">
                  <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded-[2rem] rounded-tr-none p-5 text-sm font-medium leading-relaxed">
                    "Morning works better for me, maybe next Tuesday?"
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-500 uppercase">You</div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black shrink-0 text-white shadow-lg">
                    AI
                  </div>
                  <div className="bg-slate-50 border border-slate-100 text-slate-800 rounded-[2rem] rounded-tl-none p-5 text-sm font-bold leading-relaxed flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>"Perfect! I have Tuesday at 9:00 AM with Dr. Chen. I'll send a confirmation text now."</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start justify-end opacity-60">
                  <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded-[2rem] rounded-tr-none p-5 text-sm font-medium leading-relaxed flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-500 uppercase">You</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<2s', label: 'Avg Response' },
            { value: '50+', label: 'Integrations' },
            { value: '24/7', label: 'Availability' }
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}