import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function FinalCTA() {
  return (
    <section id="book-demo" className="py-20 md:py-32 px-6 md:px-8 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative p-10 md:p-24 bg-slate-900 backdrop-blur-3xl rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800"
        >
          {/* Background utilities */}
          <div className="absolute inset-0 bg-grid-white/[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full mb-8 md:mb-10 text-slate-300 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to scale?</span>
            </div>

            <h2
              className="font-black text-4xl sm:text-6xl md:text-7xl text-white mb-8 md:mb-10 tracking-[-0.03em] leading-[1.05]"
            >
              Never miss another call. <br className="hidden sm:block" />
              <span className="italic text-white tracking-tight">Launch your AI receptionist today.</span>
            </h2>

            <p
              className="text-slate-400 text-lg md:text-xl mb-10 md:mb-14 max-w-xl mx-auto leading-relaxed font-medium"
            >
              Share your call volume, workflows, and support needs. We will help you choose the right setup for your business.
            </p>

            <div className="flex justify-center min-h-[56px]">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                <Button
                  asChild
                  className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-base shadow-xl shadow-white/10 active:scale-95 transition-all"
                >
                  <Link to="/contact" className="flex items-center gap-2">
                    Contact Us
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-black text-base active:scale-95 transition-all shadow-sm"
                >
                  <Link to="/signup">Join Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
