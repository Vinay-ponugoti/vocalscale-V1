import { BrainCircuit, Activity, ShieldCheck, Timer, Languages, Smartphone, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VoiceInput } from './VoiceInput';

function AiReceptionistVisual() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[220px]">
      <div className="flex items-center gap-8 mb-8">
        {/* Big Icon */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20"
          >
            <User className="w-12 h-12 text-white/90" strokeWidth={1.5} />
          </motion.div>
          {/* Status dot */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-1 right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full"
          />
        </div>

        {/* Voice Selection */}
        <div className="flex flex-col gap-2.5">
          {['Emma (US)', 'James (US)', 'Alice (UK)'].map((voice, i) => (
            <motion.div
              key={voice}
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium cursor-pointer transition-all hover:scale-105",
                i === 0
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-200"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
              {voice}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <VoiceInput />
      </motion.div>
    </div>
  );
}

export function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Receptionist',
      description: 'Natural, human-like conversations that handle inquiries and route calls intelligently—available 24/7.',
      className: 'md:col-span-8 md:row-span-2 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      content: <AiReceptionistVisual />
    },
    {
      icon: Timer,
      title: 'Smart Scheduling',
      description: 'Automated booking that syncs with your calendar.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Activity,
      title: 'Deep Analytics',
      description: 'Insights into call patterns and sentiment.',
      className: 'md:col-span-4 md:row-span-1 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
    },
    {
      icon: Languages,
      title: 'Global Scale',
      description: 'Speak to customers in over 50 languages. Provide a local experience, everywhere.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-600',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-Level Security',
      description: 'Protected with SOC 2 certified encryption.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Control',
      description: 'Manage your agent and review transcripts from any device, anywhere in the world.',
      className: 'md:col-span-4 md:row-span-2 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
    }
  ];

  return (
    <section id="features" className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-transparent">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-white mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Everything you need <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic tracking-tight">to scale.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            We've combined state-of-the-art Voice AI with business-grade tools to help you provide world-class service, 24/7.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 md:p-8 lg:p-10 transition-all duration-500 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10",
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
                    "w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-transform group-hover:scale-110 duration-500 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-inner"
                  )}>
                    <feature.icon className={cn("w-6 md:w-7 h-6 md:h-7 text-blue-400")} strokeWidth={1.5} />
                  </div>
                )}

                <div className="mt-auto">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-3 md:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed group-hover:text-slate-300 transition-colors mt-0">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover highlight effect */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_80%)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
