import { useState } from 'react';
import { Check, Zap, Star, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { trackStartDemo } from '@/lib/analytics';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for ambitious solo pros. Automated 24/7 AI Receptionist.',
      monthlyPrice: 69, // 30% off $99
      annualPrice: 59,  // 40% off $99
      originalPrice: 99,
      features: [
        '300 AI minutes included',
        'Extra minutes: $0.094/min',
        'In-app & Google Calendar scheduling',
        'Standard AI voice models',
        'Email support',
        'Call history & transcripts',
        '1 Local phone number'
      ],
      cta: 'Get Started Now',
      popular: false,
      icon: Zap,
      color: 'blue'
    },
    {
      name: 'Professional',
      description: 'Powerhouse for growing teams. Auto-schedule appointments & scale.',
      monthlyPrice: 118, // 30% off $169
      annualPrice: 101,  // 40% off $169
      originalPrice: 169,
      features: [
        '1000 AI minutes included',
        'Extra minutes: $0.094/min',
        'In-app & Google Calendar scheduling',
        'Premium HD voice models',
        'Priority 24/7 support',
        'Custom knowledge base',
        'Up to 5 phone numbers',
        'Sentiment analysis',
        'CRM integrations'
      ],
      cta: 'Get Started Now',
      popular: true,
      icon: Star,
      color: 'indigo'
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-transparent">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 bg-grid-slate-900/[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-600 fill-blue-600/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">The Investment</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Simple plans for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic tracking-tight">growing teams.</span>
          </motion.h2>

          {/* Pricing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={cn("text-sm font-black transition-colors uppercase tracking-widest", !isAnnual ? "text-slate-900" : "text-slate-400")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-slate-100 border border-slate-200 p-1 transition-colors hover:border-blue-400"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full bg-blue-600 shadow-sm transition-transform duration-300",
                  isAnnual ? "translate-x-8" : "translate-x-0"
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-black transition-colors uppercase tracking-widest", isAnnual ? "text-slate-900" : "text-slate-400")}>Annual</span>
              <span className="px-2 py-0.5 bg-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-md border border-blue-200">
                Save up to 40%
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={cn(
                "group relative p-1 rounded-[2.5rem] transition-all duration-500",
                plan.popular ? "bg-gradient-to-b from-blue-200 to-indigo-200 shadow-2xl shadow-blue-200/50" : "bg-transparent border border-transparent"
              )}
            >
              <div className={cn(
                "relative bg-white/80 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-12 h-full flex flex-col border",
                plan.popular ? "border-white/50" : "border-slate-200"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-blue-500/30">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 bg-white border border-slate-100 shadow-sm",
                    plan.popular ? "text-blue-600" : "text-slate-400"
                  )}>
                    <plan.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 md:mb-10">
                  <div className="flex flex-col gap-1">
                    {!isAnnual && plan.originalPrice > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl md:text-2xl font-bold text-slate-400 line-through decoration-slate-400/50 decoration-2">
                          ${plan.originalPrice}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded border border-emerald-200">
                          30% OFF
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">$</span>
                      <span className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900">
                        {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-500 font-bold ml-1 text-base md:text-lg">/mo</span>
                    </div>
                  </div>
                  {isAnnual && (
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Billed annually</p>
                  )}
                  <motion.p
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-[11px] font-bold text-emerald-600 mt-2 tracking-wide uppercase"
                  >
                    Grab Early! First 3 months same price if you subscribe now.
                  </motion.p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-[15px] font-medium text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  onClick={trackStartDemo}
                  size="lg"
                  className={cn(
                    "w-full rounded-2xl h-14 text-base font-black transition-all active:scale-95 shadow-xl shadow-blue-500/10",
                    plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
                  )}
                >
                  <a href="/signup">{plan.cta}</a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
