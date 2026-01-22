import { Sparkles, Waves, Puzzle, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Define Your Voice',
      description: 'Upload your business knowledge and set your brand tone. Our AI learns your business in seconds.',
      icon: Waves,
      color: 'blue',
    },
    {
      number: '02',
      title: 'Seamless Integration',
      description: 'Connect your existing calendar and CRM. We work with the tools you already love.',
      icon: Puzzle,
      color: 'indigo',
    },
    {
      number: '03',
      title: 'Human-Like Results',
      description: 'Your AI agent handles calls with natural empathy and perfect accuracy, 24/7.',
      icon: Star,
      color: 'violet',
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-transparent">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400 fill-blue-400/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">The Process</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-white mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Simple setup. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic tracking-tight">Sophisticated scale.</span>
          </h2>

          <p
            className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            We’ve removed the complexity from AI. Launch your front desk agent in minutes, not months.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-24 md:mb-40">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative flex flex-col p-6 md:p-10 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] md:rounded-[2.5rem] hover:bg-slate-900/60 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-inner"
                )}>
                  <step.icon className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
                </div>
                <span className="text-4xl italic text-white/5 font-black tracking-tighter group-hover:text-blue-500/10 transition-colors">
                  {step.number}
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-white mb-4">
                {step.title}
              </h3>
              <p className="text-slate-400 font-medium text-[15px] leading-relaxed group-hover:text-slate-200 transition-colors">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section - Modern Re-imagining */}
        <div
          className="relative p-1 md:p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-16 overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <motion.div
                  initial={{ rotate: -20, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20"
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="font-bold text-3xl sm:text-5xl leading-[1.1] md:leading-[1.05] tracking-tight mb-4 md:mb-6 text-white">
                  A conversation that <br />
                  <span className="text-blue-400 italic underline decoration-blue-500/20 decoration-2 md:decoration-4 underline-offset-8 tracking-tight">actually converts.</span>
                </h3>
                <p className="text-slate-300 font-medium leading-relaxed mb-6 md:mb-8 text-base md:text-lg">
                  Your AI agent handles everything from initial greeting to booking confirmation, synchronized perfectly with your team in real-time.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Natural Flow', 'Live Sync', 'Multi-Lingual'].map((tag) => (
                    <span key={tag} className="px-5 py-2 bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 text-white shadow-lg">AI</div>
                  <div
                    className="bg-blue-600 text-white rounded-[2rem] rounded-tl-none p-5 text-sm font-medium leading-relaxed shadow-lg shadow-blue-500/20"
                  >
                    "I've checked Dr. Smith's calendar. Thursday at 2:30 PM is available. Should I book that for you?"
                  </div>
                </div>

                <div className="flex gap-4 items-start justify-end">
                  <div
                    className="bg-white/5 border border-white/10 text-slate-300 rounded-[2rem] rounded-tr-none p-5 text-sm font-medium leading-relaxed"
                  >
                    "Yes please, that works perfectly."
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0 text-slate-500 uppercase">You</div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 text-white shadow-lg">AI</div>
                  <div
                    className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-[2rem] rounded-tl-none p-5 text-sm font-bold leading-relaxed flex items-center gap-3"
                  >
                    <span>"Done! You're booked for Thursday. Confirmation sent! ✨"</span>
                    <ArrowRight className="h-4 w-4 animate-bounce-x" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

