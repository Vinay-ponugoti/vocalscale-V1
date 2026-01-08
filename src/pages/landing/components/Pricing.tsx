import { useState } from 'react';
import { Check, Zap, Star } from 'lucide-react';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for solo practitioners and small local businesses.',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        '300 AI minutes included',
        'Basic appointment scheduling',
        'Standard AI voice models',
        'Email support',
        'Call history & transcripts',
        '1 Local phone number'
      ],
      cta: 'Start 14-day free trial',
      popular: false,
      icon: Zap,
      psychology: 'Essential'
    },
    {
      name: 'Professional',
      description: 'Perfect for growing teams and multi-location businesses.',
      monthlyPrice: 129,
      annualPrice: 99,
      features: [
        '1000 AI minutes included',
        'Advanced calendar sync',
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
      psychology: 'Recommended'
    }
  ];

  return (
    <section id="pricing" className="py-40 px-6 relative overflow-hidden bg-white">
      {/* --- Minimalist Background --- */}
      <div className="absolute inset-0 z-0 bg-grid-warm [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-30"></div>
      
      {/* Subtle Glows */}
      <div className="absolute top-[30%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-brand-electric/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-32 animate-fade-in">
          <span className="text-brand-electric font-black text-[13px] uppercase tracking-[0.4em] mb-6 block">
            The Investment
          </span>
          <h2 className="font-serif text-5xl sm:text-7xl text-brand-ink leading-[0.95] tracking-tight mb-8">
            Simple plans for <br />
            <span className="italic text-brand-electric">growing teams.</span>
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Choose the plan that fits your current needs. Scale up or down at any time with no hidden fees.
          </p>

          <div className="inline-flex items-center gap-2 p-1.5 bg-brand-warm rounded-3xl border border-brand-ink/5 shadow-inner">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-10 py-3 rounded-2xl transition-all duration-500 text-[14px] font-black uppercase tracking-widest ${
                !isAnnual
                  ? 'bg-white text-brand-ink shadow-lg shadow-brand-ink/5'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-10 py-3 rounded-2xl transition-all duration-500 text-[14px] font-black uppercase tracking-widest flex items-center gap-3 ${
                isAnnual
                  ? 'bg-white text-brand-ink shadow-lg shadow-brand-ink/5'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-brand-electric text-white rounded-md text-[9px] font-black">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative p-12 rounded-[48px] transition-all duration-700 animate-slide-up overflow-hidden border ${
                plan.popular 
                  ? 'bg-brand-ink text-white shadow-[0_48px_96px_-16px_rgba(26,26,26,0.15)] scale-105 z-10 border-brand-ink' 
                  : 'bg-white border-brand-ink/5 hover:border-brand-ink/20'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative z-10">
                {plan.popular && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-electric text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-10 shadow-lg shadow-brand-electric/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Recommended
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className={`text-3xl font-black mb-2 tracking-tight ${plan.popular ? 'text-white' : 'text-brand-ink'}`}>
                      {plan.name}
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${plan.popular ? 'text-brand-electric' : 'text-brand-electric'}`}>
                      {plan.psychology}
                    </span>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-warm ${plan.popular ? 'bg-white/10' : 'bg-brand-ink/5'} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                    <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-brand-ink'}`} />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-10">
                  <span className={`text-7xl font-black tracking-tighter ${plan.popular ? 'text-white' : 'text-brand-ink'}`}>
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-lg font-bold ${plan.popular ? 'text-white/40' : 'text-brand-muted'}`}>/mo</span>
                </div>

                <p className={`mb-12 text-[16px] leading-relaxed font-medium ${plan.popular ? 'text-white/60' : 'text-brand-muted'}`}>
                  {plan.description}
                </p>

                <div className="space-y-6 mb-12">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular ? 'bg-brand-electric' : 'bg-brand-warm'
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${plan.popular ? 'text-white' : 'text-brand-electric'}`} />
                      </div>
                      <span className={`text-[15px] font-medium ${plan.popular ? 'text-white/80' : 'text-brand-ink'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-6 rounded-3xl font-black text-[15px] uppercase tracking-widest transition-all duration-500 active:scale-[0.98] ${
                  plan.popular 
                    ? 'bg-brand-electric text-white hover:bg-white hover:text-brand-ink shadow-xl shadow-brand-electric/20' 
                    : 'bg-brand-ink text-white hover:bg-brand-electric'
                }`}>
                  {plan.cta}
                </button>
              </div>

              {/* Noise texture on hover */}
              <div className={`absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.1] pointer-events-none transition-opacity duration-700 bg-noise mix-blend-soft-light ${plan.popular ? 'opacity-[0.05]' : ''}`}></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-24 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-brand-muted mb-6 font-medium text-lg">
            Looking for something custom?
          </p>
          <button className="text-brand-ink hover:text-brand-electric font-black text-[14px] uppercase tracking-widest inline-flex items-center gap-3 group transition-colors">
            Contact our team
            <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
