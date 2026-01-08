import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-40 px-6 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative p-12 md:p-24 bg-brand-ink rounded-[64px] overflow-hidden shadow-2xl animate-slide-up">
          {/* Background utilities */}
          <div className="absolute inset-0 bg-grid-warm opacity-10 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#fff_30%,transparent_100%)]"></div>
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-electric/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-10 animate-fade-in">
              <Sparkles className="w-4 h-4 text-brand-electric" />
              <span className="text-[11px] text-white/80 font-black uppercase tracking-[0.2em]">Ready to scale?</span>
            </div>
            
            <h2 className="font-serif text-5xl sm:text-7xl text-white mb-10 tracking-tight leading-[0.95] animate-slide-up">
              Give your business <br />
              <span className="italic text-brand-electric">the voice it deserves.</span>
            </h2>
            
            <p className="text-white/60 text-lg sm:text-xl mb-14 max-w-xl mx-auto leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '200ms' }}>
              Join forward-thinking businesses scaling their front desk with Vocal Scale's AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <a 
                href="#" 
                className="group w-full sm:w-auto px-12 py-6 bg-white text-brand-ink rounded-3xl font-black text-[15px] uppercase tracking-widest hover:bg-brand-electric hover:text-white transition-all duration-500 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </a>
              
              <button className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white border border-white/10 rounded-3xl font-black text-[15px] uppercase tracking-widest hover:bg-white/10 transition-all duration-500 backdrop-blur-sm active:scale-[0.98]">
                Schedule Demo
              </button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/40 text-[11px] font-black uppercase tracking-widest animate-fade-in" style={{ animationDelay: '600ms' }}>
              <span>No credit card</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>14-day trial</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>Cancel anytime</span>
            </div>
          </div>
          
          {/* Noise texture */}
          <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-noise mix-blend-soft-light"></div>
        </div>
      </div>
    </section>
  );
}