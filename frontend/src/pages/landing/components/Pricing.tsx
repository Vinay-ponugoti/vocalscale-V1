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
      monthlyPrice: 69,
      annualPrice: 59,
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
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Professional',
      description: 'Powerhouse for growing teams. Auto-schedule appointments & scale.',
      monthlyPrice: 118,
      annualPrice: 101,
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
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 relative overflow-hidden bg-slate-50">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600 fill-blue-600/20" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">The Investment</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[0.95]"
          >
            Simple plans for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">growing teams.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto font-medium"
          >
            Transparent pricing with no hidden fees. Save up to 85% compared to traditional receptionist services.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mt-10"
          >
            <div className="bg-white p-1.5 rounded-full border border-slate-200 inline-flex items-center relative shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all relative z-10",
                  !isAnnual ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all relative z-10 flex items-center gap-2",
                  isAnnual ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Annual
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  -40%
                </span>
              </button>
              <div
                className={cn(
                  "absolute top-1.5 left-1.5 bottom-1.5 w-[50%] bg-slate-100 rounded-full transition-all duration-300 ease-spring",
                  isAnnual ? "translate-x-[98%]" : "translate-x-0"
                )}
              />
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={cn(
                "group relative p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col",
                plan.popular
                  ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50"
                  : "bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-8">
                  <div className="bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", plan.color)}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-500 font-bold">/mo</span>
                </div>
                {!isAnnual && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-slate-400 line-through decoration-2">
                      ${plan.originalPrice}
                    </span>
                    <span className="text-emerald-600 text-xs font-bold uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded">
                      30% OFF Limited Time
                    </span>
                  </div>
                )}
                <p className="text-xs font-bold text-blue-600 mt-4 uppercase tracking-wide">
                  First 3 months locked in
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-slate-600 stroke-[3px]" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                onClick={trackStartDemo}
                size="lg"
                className={cn(
                  "w-full rounded-2xl h-14 text-sm font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95",
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                )}
              >
                <a href="/signup">{plan.cta}</a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Scalable Solutions for Enterprise</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Designed for organizations managing high-volume customer interactions.
                Includes dedicated account management, custom voice models, and advanced security protocols (HIPAA, SOC 2).
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {['Volume Pricing', 'Custom AI Models', 'SLA Guarantee', 'Dedicated Support'].map(tag => (
                  <div key={tag} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300">
                    {tag}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors"
              >
                Contact Sales
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">5k+</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Monthly Calls</div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Uptime SLA</div>
              </div>
              <div className="col-span-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">Custom Integration</div>
                  <div className="text-xs text-slate-400">CRM, ERP & BI Systems</div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/50" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

