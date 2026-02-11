import { Sparkles, Waves, Puzzle, Star, ArrowRight, Check, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const steps = [
  {
    number: '01',
    title: 'Define Your Voice',
    description: 'Upload your business knowledge and set your brand tone. Our AI learns your business in seconds.',
    icon: Waves,
    color: 'bg-blue-500',
    delay: 0.1
  },
  {
    number: '02',
    title: 'Seamless Integration',
    description: 'Connect your existing calendar and CRM. We work with the tools you already love.',
    icon: Puzzle,
    color: 'bg-indigo-500',
    delay: 0.2
  },
  {
    number: '03',
    title: 'Human-Like Results',
    description: 'Your AI agent handles calls with natural empathy and perfect accuracy, 24/7.',
    icon: Star,
    color: 'bg-violet-500',
    delay: 0.3
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600 fill-blue-600/20" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">The Process</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[0.95]"
          >
            Simple setup. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Sophisticated scale.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed"
          >
            We’ve removed the complexity from AI. Launch your front desk agent in minutes, not months.
          </motion.p>
        </div>

        {/* Bento Grid Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: step.delay }}
              className="group relative flex flex-col p-8 md:p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 font-[1000] text-9xl text-slate-900 leading-none select-none pointer-events-none group-hover:opacity-5 transition-opacity">
                {step.number}
              </div>

              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 duration-500 text-white",
                step.color
              )}>
                <step.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed text-[15px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Interactive Highlight Section */}
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

          <div className="relative z-10 grid lg:grid-cols-2 lg:items-center">
            <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-blue-400 font-bold tracking-widest uppercase text-xs mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Live Demo
              </div>

              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1]">
                A conversation that <br />
                <span className="text-blue-400">actually converts.</span>
              </h3>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
                Your AI agent handles everything from initial greeting to booking confirmation, synchronized perfectly with your team in real-time.
              </p>

              <div className="flex flex-wrap gap-3">
                {['Natural Flow', 'Live Sync', 'Multi-Lingual'].map((tag) => (
                  <div key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/5 backdrop-blur-sm text-sm font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative bg-slate-800/50 p-8 md:p-12 lg:h-full flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/10">
              {/* Chat Interface Mockup */}
              <div className="w-full max-w-md space-y-6">

                {/* Message 1 (AI) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-none p-5 border border-white/5 text-slate-100 shadow-xl">
                    <p className="font-medium leading-relaxed">"I've checked Dr. Smith's calendar. Thursday at 2:30 PM is available. Should I book that for you?"</p>
                  </div>
                </motion.div>

                {/* Message 2 (User) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4 flex-row-reverse"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-slate-400">YOU</div>
                  <div className="bg-blue-600 rounded-2xl rounded-tr-none p-5 text-white shadow-xl shadow-blue-600/10">
                    <p className="font-medium">"Yes please, that works perfectly."</p>
                  </div>
                </motion.div>

                {/* Message 3 (AI Audio) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-none p-4 border border-white/5 text-slate-100 shadow-xl min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-2/3" />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40 font-mono">
                          <span>0:04</span>
                          <span>0:06</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 font-medium text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Booking confirmed for Thursday!
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


