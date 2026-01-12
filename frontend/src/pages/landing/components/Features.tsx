import { Bot, BarChart3, Shield, Calendar, Globe, Smartphone } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Bot,
      title: 'AI Receptionist',
      description: 'Natural, human-like conversations that handle inquiries and route calls intelligently—available 24/7.',
      psychology: 'Reliability'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated booking that syncs with your calendar. No more back-and-forth emails or missed calls.',
      psychology: 'Efficiency'
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Insights into call patterns and customer sentiment. Make data-driven decisions with ease.',
      psychology: 'Clarity'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your customer data is protected with SOC 2 certified encryption and the highest security standards.',
      psychology: 'Safety'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Speak to your customers in over 50 languages. Provide a local experience, everywhere.',
      psychology: 'Growth'
    },
    {
      icon: Smartphone,
      title: 'Mobile Control',
      description: 'Manage your agent and review transcripts from any device, anywhere in the world.',
      psychology: 'Freedom'
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-40 px-6 relative overflow-hidden bg-white">
      {/* --- Minimalist Background --- */}
      <div className="absolute inset-0 z-0 bg-grid-warm [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-30"></div>
      
      {/* Subtle Glows */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-electric/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-electric/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-24 gap-8 sm:gap-12">
          <div className="max-w-2xl animate-fade-in">
            <span className="text-brand-electric font-black text-[11px] sm:text-[13px] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 sm:mb-6 block">
              The Platform
            </span>
            <h2 className="font-serif text-4xl sm:text-7xl text-brand-ink leading-[1.1] sm:leading-[0.95] tracking-tight">
              Powerful tools for <br className="hidden sm:block" />
              <span className="italic">every business.</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg text-brand-muted max-w-sm mb-2 font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            We’ve built everything you need to scale your customer interaction without losing the human touch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1px bg-brand-ink/5 border border-brand-ink/5 rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl shadow-brand-ink/5 animate-slide-up">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-8 sm:p-12 bg-white hover:bg-brand-warm transition-all duration-700 cursor-pointer overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-brand-ink/5 flex items-center justify-center mb-8 sm:mb-10 group-hover:bg-brand-electric group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-brand-ink group-hover:text-white transition-colors" />
                </div>
                
                <span className="text-[10px] font-black text-brand-electric uppercase tracking-[0.3em] mb-4 block">
                  {feature.psychology}
                </span>
                
                <h3 className="text-2xl font-black text-brand-ink mb-6 tracking-tight group-hover:text-brand-electric transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-brand-muted font-medium leading-relaxed text-[15px] group-hover:text-brand-ink transition-colors duration-500">
                  {feature.description}
                </p>
              </div>

              {/* Noise texture on hover */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.3] pointer-events-none transition-opacity duration-700 bg-noise mix-blend-soft-light"></div>
              
              {/* Intentional reveal line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brand-electric transition-all duration-700 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
