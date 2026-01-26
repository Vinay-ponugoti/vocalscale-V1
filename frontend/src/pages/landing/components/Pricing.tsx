import { useState } from 'react';
import { Check, Zap, Star, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

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
      cta: 'Start 14-day free trial',
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
      cta: 'Start 14-day free trial',
      popular: true,
      icon: Star,
      color: 'indigo'
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-transparent">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-24">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400 fill-blue-400/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">The Investment</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-[-0.03em] text-white mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Simple plans for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic tracking-tight">growing teams.</span>
          </h2>

          {/* Pricing Toggle */}
          <div
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={cn("text-sm font-black transition-colors uppercase tracking-widest", !isAnnual ? "text-white" : "text-slate-500")}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-white/5 border border-white/10 p-1 transition-colors hover:border-blue-400"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full bg-blue-500 shadow-sm transition-transform duration-300",
                  isAnnual ? "translate-x-8" : "translate-x-0"
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-black transition-colors uppercase tracking-widest", isAnnual ? "text-white" : "text-slate-500")}>Annual</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-tighter rounded-md border border-blue-500/20">
                Save up to 40%
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "group relative p-1 rounded-[2.5rem] transition-all duration-500",
                plan.popular ? "bg-gradient-to-b from-blue-500/20 to-indigo-500/20 shadow-2xl shadow-blue-500/10" : "bg-white/5"
              )}
            >
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-12 h-full flex flex-col border border-white/5">
                {plan.popular && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-blue-500/30">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-inner",
                    plan.popular ? "text-blue-400" : "text-slate-400"
                  )}>
                    <plan.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 md:mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl md:text-2xl font-bold text-slate-500 line-through decoration-slate-500/50 decoration-2">
                      ${plan.originalPrice}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-6xl font-black tracking-tighter text-white">$</span>
                      <span
                        className="text-5xl md:text-7xl font-black tracking-tighter text-white"
                      >
                        {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-500 font-bold ml-1 text-base md:text-lg">/mo</span>
                    </div>
                  </div>
                  {isAnnual && (
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Billed annually</p>
                  )}
                  <p className="text-[11px] font-bold text-emerald-400 mt-2 tracking-wide uppercase">
                    Grab Early! First 3 months same price if you subscribe now.
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.popular ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-500"
                      )}>
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-[15px] font-medium text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full rounded-2xl h-14 text-base font-black transition-all active:scale-95 shadow-xl shadow-blue-500/10",
                    plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  <a href="/signup">{plan.cta}</a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

