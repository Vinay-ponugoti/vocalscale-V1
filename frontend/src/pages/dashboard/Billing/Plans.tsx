import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Shield, ArrowLeft, Crown, Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import DashboardLayout from '../../layouts/DashboardLayout';
import { billingApi } from '../../../api/billing';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

import { useAuth } from '../../../context/AuthContext';

const Plans: React.FC = () => {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plansData, setPlansData] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plans, sub] = await Promise.all([
          billingApi.getPlans(),
          billingApi.getSubscription()
        ]);
        setPlansData(plans);
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();

    // Refetch subscription every 30 seconds to catch recent purchases
    const interval = setInterval(async () => {
      try {
        const sub = await billingApi.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error refetching subscription:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoading(planName);
    setError(null);
    try {
      if (!user?.email) {
        throw new Error('User email is required for checkout');
      }
      const { url } = await billingApi.createCheckoutSession(priceId, user.email);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const planDesignInfo: Record<string, any> = {
    'Starter': { icon: Zap, popular: false, color: 'blue' },
    'Professional': { icon: Star, popular: true, color: 'indigo' },
    'Elite': { icon: Crown, popular: false, color: 'violet' },
  };

  const getDisplayPlans = () => {
    const currentPlanId = subscription?.plans?.id;

    if (plansData.length > 0) {
      const groupedPlans: Record<string, any> = {};

      plansData.forEach(plan => {
        if (!groupedPlans[plan.name]) {
          groupedPlans[plan.name] = {
            ...plan,
            ...planDesignInfo[plan.name] || { icon: Star, psychology: 'Custom' },
            description: plan.description || getDefaultDescription(plan.name),
            features: plan.features || getDefaultFeatures(plan.name),
            monthlyPrice: 0,
            annualPrice: 0,
            monthlyPriceId: '',
            annualPriceId: '',
            current: false,
          };
        }

        if (plan.interval === 'month') {
          groupedPlans[plan.name].monthlyPrice = plan.price_amount / 100;
          groupedPlans[plan.name].monthlyPriceId = plan.stripe_price_id;
          groupedPlans[plan.name].originalMonthlyPrice = plan.name === 'Starter' ? 99 : plan.name === 'Professional' ? 169 : 0;
        } else if (plan.interval === 'year') {
          groupedPlans[plan.name].annualPrice = (plan.price_amount / 100) / 12;
          groupedPlans[plan.name].annualPriceId = plan.stripe_price_id;
        }

        if (plan.id === currentPlanId) {
          groupedPlans[plan.name].current = true;
          groupedPlans[plan.name].currentInterval = plan.interval;
        }
      });

      return Object.values(groupedPlans).map(plan => ({
        ...plan,
        cta: plan.current ? 'Current Plan' : (plan.name === 'Elite' ? 'Contact Sales' : `Upgrade to ${plan.name}`),
        stripe_price_id: isAnnual ? (plan.annualPriceId || plan.monthlyPriceId) : (plan.monthlyPriceId || plan.annualPriceId),
        monthlyPrice: plan.monthlyPrice || plan.annualPrice * 1.2,
        annualPrice: plan.annualPrice || plan.monthlyPrice * 0.8,
        contactUs: plan.name === 'Elite'
      }));
    }

    return [
      {
        name: 'Starter',
        description: 'Perfect for ambitious solo pros. Automated 24/7 AI Receptionist.',
        monthlyPrice: 69,
        originalMonthlyPrice: 99,
        annualPrice: 59, // Assuming annual discount around 20% ~ 55, setting to 59
        features: [
          '300 AI minutes included',
          'Extra minutes: $0.094/min',
          'In-app & Google Calendar scheduling',
          'Standard AI voice models',
          'Email support',
          'Call history & transcripts',
          '1 Local phone number',
        ],
        cta: 'Upgrade to Starter',
        current: false,
        icon: Zap,
        psychology: 'Essential',
        stripe_price_id: 'price_starter',
        promoText: 'Grab Early! First 3 months same price if you subscribe now.'
      },
      {
        name: 'Professional',
        description: 'Powerhouse for growing teams. Auto-schedule appointments & scale.',
        monthlyPrice: 118,
        originalMonthlyPrice: 169,
        annualPrice: 99, // Assuming ~$100 annual
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
        cta: 'Upgrade to Professional',
        current: false,
        icon: Star,
        psychology: 'Most Popular',
        stripe_price_id: 'price_pro',
        promoText: 'Grab Early! First 3 months same price if you subscribe now.'
      },
      {
        name: 'Elite',
        description: 'Maximum power for high-volume businesses and agencies.',
        monthlyPrice: 0, // Contact Us
        annualPrice: 0,
        features: [
          'Custom AI minutes',
          'Dedicated account manager',
          'Custom voice cloning',
          'API access & webhooks',
          'White-label options',
          'Unlimited phone numbers',
          'Advanced analytics dashboard',
          'Custom CRM development'
        ],
        cta: 'Contact Sales',
        current: false,
        icon: Crown,
        psychology: 'Ultimate',
        stripe_price_id: 'price_elite',
        contactUs: true
      }
    ];
  };

  const getDefaultDescription = (name: string) => {
    if (name === 'Starter') return 'Perfect for ambitious solo pros. Automated 24/7 AI Receptionist.';
    if (name === 'Professional') return 'Powerhouse for growing teams. Auto-schedule appointments & scale.';
    if (name === 'Elite') return 'Maximum power for high-volume businesses and agencies.';
    return 'Scale your business with the right AI capabilities.';
  };

  const getDefaultFeatures = (name: string) => {
    if (name === 'Starter') return [
      '300 AI minutes included',
      'Extra minutes: $0.094/min',
      'In-app & Google Calendar scheduling',
      'Standard AI voice models',
      'Email support',
      'Call history & transcripts',
      '1 Local phone number'
    ];
    if (name === 'Professional') return [
      '1000 AI minutes included',
      'Extra minutes: $0.094/min',
      'In-app & Google Calendar scheduling',
      'Premium HD voice models',
      'Priority 24/7 support',
      'Custom knowledge base',
      'Up to 5 phone numbers',
      'Sentiment analysis',
      'CRM integrations'
    ];
    if (name === 'Elite') return [
      'Custom AI minutes',
      'Dedicated account manager',
      'Custom voice cloning',
      'API access & webhooks',
      'White-label options',
      'Unlimited phone numbers',
      'Advanced analytics dashboard',
      'Custom CRM development'
    ];
    return ['AI minutes included', 'Standard support'];
  };

  const plans = getDisplayPlans();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} className="text-charcoal animate-spin" />
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors w-fit group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black text-charcoal tracking-tight">Select Plan</h1>
                  <p className="text-charcoal-light text-sm font-medium mt-2">Upgrade your AI capabilities instantly.</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 h-fit">
                  <span className={cn("text-[10px] font-black transition-colors uppercase tracking-widest", !isAnnual ? "text-slate-900" : "text-slate-400")}>Monthly</span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="relative w-12 h-6 rounded-full bg-slate-100 border border-slate-200 p-1 transition-colors hover:border-blue-400"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full bg-blue-600 shadow-sm transition-transform duration-300",
                        isAnnual ? "translate-x-6" : "translate-x-0"
                      )}
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black transition-colors uppercase tracking-widest", isAnnual ? "text-slate-900" : "text-slate-400")}>Annual</span>
                    <span className="px-2 py-0.5 bg-blue-100/50 text-blue-600 text-[9px] font-black uppercase tracking-tighter rounded-md border border-blue-200">
                      Save up to 40%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 pt-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "group relative p-1 rounded-[2.5rem] transition-all duration-500",
                    plan.popular ? "bg-gradient-to-b from-blue-200 to-indigo-200 shadow-2xl shadow-blue-200/50" : "bg-transparent border border-transparent",
                    plan.current && "ring-2 ring-blue-600 ring-offset-4 ring-offset-white"
                  )}
                >
                  <div className={cn(
                    "relative bg-white rounded-[2.4rem] p-8 h-full flex flex-col border",
                    plan.popular ? "border-white/50" : "border-slate-200 shadow-xl shadow-slate-200/50"
                  )}>
                    {plan.current && (
                      <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-emerald-500/30">
                        <Check size={12} strokeWidth={4} />
                        Current Plan
                      </div>
                    )}

                    {!plan.current && plan.popular && (
                      <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-blue-500/30">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 bg-white border border-slate-100 shadow-sm",
                        plan.popular ? "text-blue-600" : "text-slate-400"
                      )}>
                        <plan.icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-slate-600 font-medium text-xs leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        {!plan.contactUs && plan.originalMonthlyPrice > 0 && !isAnnual && (
                          <span className="text-lg font-bold text-slate-400 line-through decoration-slate-400/50 decoration-2">
                            ${plan.originalMonthlyPrice}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          {plan.contactUs ? (
                            <span className="text-4xl font-black tracking-tighter text-slate-900">Custom</span>
                          ) : (
                            <>
                              <span className="text-4xl font-black tracking-tighter text-slate-900">$</span>
                              <span className="text-5xl font-black tracking-tighter text-slate-900">
                                {Math.round(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                              </span>
                              <span className="text-slate-500 font-bold ml-1 text-sm">/mo</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isAnnual && !plan.contactUs && (
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Billed annually</p>
                      )}

                      {plan.promoText && (
                        <div className="mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-100">
                          {plan.promoText}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature: string) => (
                        <div key={feature} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                          )}>
                            <Check className="w-3 h-3 stroke-[3px]" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={plan.current || loading === plan.name}
                      onClick={() => {
                        if (plan.contactUs) {
                          window.location.href = 'mailto:sales@vocalscale.com';
                        } else {
                          handleUpgrade(plan.stripe_price_id, plan.name);
                        }
                      }}
                      className={cn(
                        "w-full rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2",
                        plan.current
                          ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default"
                          : plan.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                      )}
                    >
                      {loading === plan.name ? <Loader2 size={16} className="animate-spin" /> : plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enterprise Section - Compact */}
            <Card className="mt-8 border-none shadow-xl shadow-charcoal/5 bg-gradient-to-br from-charcoal to-charcoal-dark text-white">
              <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col gap-3 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <Shield size={20} className="text-white/80" />
                    <h4 className="text-lg font-black tracking-tight">Enterprise Scale</h4>
                  </div>
                  <p className="text-sm font-medium text-white/70 max-w-xl leading-relaxed">
                    Need custom infrastructure, volume discounts, or white-glove onboarding? We built dedicated solutions for large agencies.
                  </p>
                </div>

                <button className="px-8 py-3.5 rounded-xl bg-white text-charcoal font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg whitespace-nowrap">
                  Contact Sales
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;
