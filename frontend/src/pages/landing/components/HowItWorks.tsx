import { Sparkles, Zap, Settings, CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Define Your Voice',
      description: 'Upload your business knowledge and set your brand tone. Our AI learns your business in seconds.',
      icon: Settings,
      psychology: 'Control'
    },
    {
      number: '02',
      title: 'Seamless Integration',
      description: 'Connect your existing calendar and CRM. We work with the tools you already love.',
      icon: Zap,
      psychology: 'Simplicity'
    },
    {
      number: '03',
      title: 'Human-Like Results',
      description: 'Your AI agent handles calls with natural empathy and perfect accuracy, 24/7.',
      icon: CheckCircle2,
      psychology: 'Growth'
    }
  ];

  return (
    <section id="how-it-works" className="py-40 px-6 relative overflow-hidden bg-white">
      {/* --- Minimalist Background --- */}
      <div className="absolute inset-0 z-0 bg-grid-warm [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
      
      {/* Subtle Glows */}
      <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-electric/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-brand-electric/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-32 animate-fade-in">
          <span className="text-brand-electric font-black text-[13px] uppercase tracking-[0.4em] mb-6 block">
            The Process
          </span>
          <h2 className="font-serif text-5xl sm:text-7xl text-brand-ink leading-[0.95] tracking-tight mb-8">
            Simple setup. <br />
            <span className="italic">Sophisticated scale.</span>
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl font-medium leading-relaxed">
            We’ve removed the complexity from AI. Launch your front desk agent in minutes, not months.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-32">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative flex flex-col p-12 bg-brand-warm/50 border border-brand-ink/5 rounded-[40px] hover:bg-brand-warm transition-all duration-700 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-10 relative">
                <div className="w-16 h-16 bg-brand-ink text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-brand-electric group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border border-brand-ink/5 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-sm font-black text-brand-ink">{step.number}</span>
                </div>
              </div>

              <span className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em] mb-4 block">
                {step.psychology}
              </span>
              
              <h3 className="text-2xl font-black text-brand-ink mb-4 tracking-tight group-hover:text-brand-electric transition-colors">
                {step.title}
              </h3>
              
              <p className="text-brand-muted font-medium leading-relaxed text-[15px] group-hover:text-brand-ink transition-colors duration-500">
                {step.description}
              </p>

              {/* Noise texture on hover */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.2] pointer-events-none transition-opacity duration-700 bg-noise mix-blend-soft-light rounded-[40px]"></div>
            </div>
          ))}
        </div>

        {/* --- Simplified Contextual Interaction --- */}
        <div className="relative p-12 bg-brand-ink text-white rounded-[48px] overflow-hidden shadow-2xl animate-slide-up">
          <div className="absolute inset-0 bg-grid-warm opacity-10 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#fff_30%,transparent_100%)]"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="w-14 h-14 bg-brand-electric rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-brand-electric/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-4xl sm:text-5xl leading-tight mb-6">
                A conversation that <br />
                <span className="italic text-brand-electric">actually converts.</span>
              </h3>
              <p className="text-white/60 font-medium leading-relaxed mb-8 text-lg">
                Your AI agent handles everything from initial greeting to booking confirmation, synchronized perfectly with your team.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Natural Flow', 'Live Sync', 'Multi-Lingual'].map((tag) => (
                  <span key={tag} className="px-5 py-2 bg-white/5 border border-white/10 text-white/80 text-xs font-black uppercase tracking-widest rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px] p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-electric flex items-center justify-center text-[10px] font-black shrink-0">AI</div>
                <div className="bg-white/10 rounded-2xl rounded-tl-none p-5 text-sm font-medium leading-relaxed">
                  "I've checked the calendar for Dr. Smith. Thursday at 2:30 PM is available. Shall I book that for you?"
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-5 text-sm font-medium leading-relaxed text-white/60">
                  "Yes please, that works perfectly."
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 text-white/40">YOU</div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-electric flex items-center justify-center text-[10px] font-black shrink-0">AI</div>
                <div className="bg-brand-electric/20 border border-brand-electric/30 rounded-2xl rounded-tl-none p-5 text-sm font-black text-white">
                  "Done! You're all set for Thursday. We've sent a confirmation to your email. ✨"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
