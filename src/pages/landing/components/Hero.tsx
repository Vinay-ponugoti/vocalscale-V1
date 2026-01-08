import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden bg-brand-warm">
      {/* --- Minimalist Background --- */}
      
      {/* 1. Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-warm [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)] opacity-40"></div>

      {/* 2. Intentional Ambient Glows (Multi-color for depth) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-electric/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* 3. Noise Texture Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.4] pointer-events-none bg-noise mix-blend-soft-light"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          {/* Typographic Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-ink/5 border border-brand-ink/10 rounded-full mb-10 animate-fade-in backdrop-blur-sm group hover:border-brand-electric/30 transition-colors duration-500">
            <Sparkles className="w-4 h-4 text-brand-electric group-hover:scale-125 transition-transform duration-500" />
            <span className="text-[11px] text-brand-ink font-black tracking-[0.25em] uppercase">The Future of Customer Service</span>
          </div>

          <h1 className="text-center mb-10 max-w-5xl">
            <span className="block text-[13px] font-black uppercase tracking-[0.4em] text-brand-electric mb-6 animate-slide-up">
              Voice AI for Modern Business
            </span>
            <span className="font-serif text-6xl sm:text-7xl md:text-[92px] text-brand-ink leading-[0.95] tracking-tight animate-slide-up block">
              Give your front desk <br />
              <span className="italic bg-gradient-to-r from-brand-electric via-indigo-600 to-brand-electric bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-flow">superpowers.</span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-brand-muted max-w-2xl text-center mb-14 leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '200ms' }}>
            Vocal Scale automates your customer calls with human-like intelligence. 
            Answer questions, schedule bookings, and grow your business while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <button className="group px-10 py-5 bg-brand-electric text-white rounded-full font-black text-lg hover:shadow-[0_20px_40px_-10px_rgba(45,91,255,0.4)] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] flex items-center gap-3">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="group px-10 py-5 bg-transparent text-brand-ink border-2 border-brand-ink/10 rounded-full font-black text-lg hover:bg-brand-ink hover:text-white hover:border-brand-ink transition-all duration-500 flex items-center gap-3">
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </div>

          {/* Social Proof / Trust Markers - Editorial Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 border-t border-brand-ink/5 pt-12 w-full max-w-4xl animate-fade-in" style={{ animationDelay: '600ms' }}>
            {[
              { label: 'Instant Setup', sub: 'Ready in 5 minutes' },
              { label: 'Human-Like', sub: '99% Accuracy' },
              { label: 'Always On', sub: '24/7/365 Coverage' }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="text-brand-ink font-black text-lg mb-1 group-hover:text-brand-electric transition-colors tracking-tight uppercase">
                  {item.label}
                </div>
                <div className="text-brand-muted text-sm font-bold uppercase tracking-widest opacity-60">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
