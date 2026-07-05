import { Check, PhoneCall, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { trackStartDemo } from '@/lib/analytics';

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      description: 'For owners and small teams that need dependable phone coverage without adding another seat at the desk.',
      features: [
        '24/7 call answering for routine requests',
        'Books appointments into Google Calendar & Outlook',
        'Voice options and multilingual support',
        'Full call transcripts, summaries & recordings',
        '1 local business number',
        'Call routing and message taking',
        'Email support'
      ],
      cta: 'Contact Us',
      popular: false,
      icon: PhoneCall,
      color: 'blue'
    },
    {
      name: 'Professional',
      description: 'For teams with more call volume, more locations, or a bigger follow-up workflow.',
      features: [
        'Everything in Starter, plus:',
        'Expanded voice and language options',
        'Custom knowledge base for your business',
        'Up to 5 phone numbers',
        'Sentiment analysis & automatic lead scoring',
        'CRM sync — HubSpot, Salesforce, Pipedrive',
        'SMS follow-up for missed calls',
        'Priority 24/7 support'
      ],
      cta: 'Contact Us',
      popular: true,
      icon: Star,
      color: 'indigo'
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-32 px-6 md:px-8 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 backdrop-blur-sm mb-6 md:mb-8 shadow-sm"
          >
            <PhoneCall className="h-4 w-4 text-slate-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Plans</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-normal text-slate-900 mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Pick the coverage <br />
            your phone needs.
          </motion.h2>

          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Plans are built around call volume, scheduling complexity, handoff rules, and support needs. Start with the workflow your callers already expect.
          </p>
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
                "group relative p-1 rounded-2xl transition-all duration-300",
                plan.popular ? "bg-slate-200 shadow-xl shadow-slate-200" : "bg-transparent border border-transparent"
              )}
            >
              <div className={cn(
                "relative bg-white rounded-2xl p-8 md:p-12 h-full flex flex-col border",
                plan.popular ? "border-slate-300" : "border-slate-200"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-slate-500/30">
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
                  <h3 className="text-3xl font-black tracking-normal text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 md:mb-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline">
                      <span className="text-4xl md:text-6xl font-black tracking-normal text-slate-900">
                        Contact Us
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                      For pricing
                    </p>
                  </div>

                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.popular ? "bg-slate-100 text-slate-800 border border-slate-200" : "bg-slate-100 text-slate-400"
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
                  <Link to="/contact">{plan.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scalability and Enterprise Solutions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-12 md:mt-14"
        >
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
            <div className="mb-8 max-w-3xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">For larger teams and multiple locations</h3>
              <p className="text-slate-600 leading-relaxed">
                Larger teams often need location-specific routing, department rules, and a rollout plan. We can help map those workflows before anything goes live.
              </p>
            </div>
            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Configuration options</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-800 mt-0.5 shrink-0" />
                    <span><strong>Business language:</strong> Add terminology, FAQs, policies, and service details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-800 mt-0.5 shrink-0" />
                    <span><strong>Integrations:</strong> Connect calendars, CRM records, and reporting workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-800 mt-0.5 shrink-0" />
                    <span><strong>Multi-location support:</strong> Route callers by office, service line, or availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-800 mt-0.5 shrink-0" />
                    <span><strong>Controls:</strong> Keep records, permissions, and escalation rules organized</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Volume planning</h4>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Higher call volume changes what matters: overflow behavior, staff handoffs, reporting, and support expectations. We will size the plan around those requirements.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-800 font-medium">
                    Contact our enterprise sales team for custom pricing tailored to your organization's specific requirements and usage patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
