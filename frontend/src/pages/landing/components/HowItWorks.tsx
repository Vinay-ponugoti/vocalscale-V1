import { Cable, ClipboardList, Headphones, PhoneIncoming } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { LiveCallDemo } from './LiveCallDemo';

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
      title: 'Write the call rules',
      description: 'Add the questions callers should be asked, when to book, what to avoid, and when a person should step in.',
      icon: ClipboardList,
      color: 'blue',
      features: ['Intake questions', 'Booking rules', 'Escalation notes']
    },
    {
      number: '02',
      title: 'Connect the basics',
      description: 'Attach the business number, calendar, and caller records your team already depends on.',
      icon: Cable,
      color: 'indigo',
      features: ['Phone number', 'Calendar sync', 'Caller history']
    },
    {
      number: '03',
      title: 'Start answering',
      description: 'Calls are answered, summarized, and routed with the same workflow every time.',
      icon: PhoneIncoming,
      color: 'violet',
      features: ['Call summaries', 'Routing', 'Follow-up notes']
    }
  ];

  return (
    <section ref={sectionRef} id="how-it-works" className="-mt-8 md:-mt-14 pt-4 md:pt-8 pb-12 md:pb-16 px-6 md:px-8 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-5 md:mb-6 shadow-sm hover:shadow-md transition-shadow">
            <ClipboardList className="h-4 w-4 text-slate-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">How It Works</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-normal text-slate-900 mb-4 md:mb-5 leading-[1.1] md:leading-[1.05]">
            Setup that follows <br />
            how your desk works.
          </h2>

          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Start with the everyday details: what callers ask, what your team needs, and when the call should move to a real person.
          </p>
        </div>

        <div className="relative mb-14 md:mb-24">
          {/* Timeline connector (desktop) */}
          <div aria-hidden="true" className="hidden lg:block absolute top-7 inset-x-0 h-px bg-slate-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-10">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveStep(index)}
                  className="group relative"
                >
                  <div className="flex items-center gap-5">
                    {/* Step node */}
                    <div
                      className={cn(
                        "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white border transition-all duration-500",
                        isActive
                          ? "border-blue-600 shadow-lg shadow-blue-500/20"
                          : "border-slate-200 shadow-sm group-hover:border-slate-300"
                      )}
                    >
                      <step.icon
                        className={cn(
                          "w-6 h-6 transition-colors duration-500",
                          isActive ? "text-blue-600" : "text-slate-400"
                        )}
                        strokeWidth={1.5}
                      />
                    </div>

                    <div>
                      <span
                        className={cn(
                          "block text-[10px] font-black uppercase tracking-[0.25em] transition-colors duration-500",
                          isActive ? "text-blue-600" : "text-slate-400"
                        )}
                      >
                        Step {step.number}
                      </span>
                      <h3 className="mt-1 text-xl md:text-2xl font-bold tracking-normal text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 lg:mt-6">
                    <p className="text-slate-600 font-medium text-[15px] leading-relaxed">
                      {step.description}
                    </p>

                    <ul
                      className={cn(
                        "mt-5 space-y-2.5 border-l pl-5 transition-colors duration-500",
                        isActive ? "border-blue-200" : "border-slate-200"
                      )}
                    >
                      {step.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2.5 text-sm font-semibold text-slate-500"
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                              isActive ? "bg-blue-600" : "bg-slate-300"
                            )}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Demo Section - Voice AI Showcase */}
        <div className="relative border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
          <div className="relative p-8 md:p-16 overflow-hidden">
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

                <h3 className="font-bold text-3xl sm:text-5xl leading-[1.1] md:leading-[1.05] tracking-normal mb-4 md:mb-6 text-slate-900">
                  Try the phone flow before you trust it.
                </h3>

                <p className="text-slate-600 font-medium leading-relaxed mb-6 md:mb-8 text-base md:text-lg">
                  Use the live browser call to hear pacing, interruptions, and how the receptionist handles ordinary questions.
                </p>

                <div className="flex flex-wrap gap-3">
                  {['Pacing', 'Interruptions', 'Booking rules'].map((tag) => (
                    <span key={tag} className="px-5 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real live call demo — talks to the actual AI agent */}
              <LiveCallDemo />
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
