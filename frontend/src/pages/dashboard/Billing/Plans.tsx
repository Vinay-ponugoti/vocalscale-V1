import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Shield, ArrowLeft, Crown, Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import DashboardLayout from '../../layouts/DashboardLayout';
import { billingApi } from '../../../api/billing';

import { useAuth } from '../../../context/AuthContext';

interface Plan {
  id?: string;
  name: string;
  description?: string;
  price_amount: number;
  interval: string;
  stripe_price_id?: string;
  features?: string[];
  limits?: { ai_minutes?: number };
}

interface Subscription {
  status: string;
  plan?: string;
  plan_name?: string;
  stripe_price_id?: string;
  next_billing?: string;
}

interface GroupedPlan {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  current: boolean;
  currentInterval?: string;
  icon: React.FC<{ className?: string; size?: number; strokeWidth?: number }>;
  popular: boolean;
  color: string;
  originalMonthlyPrice: number;
  stripe_price_id: string;
  cta: string;
  contactUs?: boolean;
  promoText?: string;
}

const Plans: React.FC = () => {
  const { user, profile } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plansData, setPlansData] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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

    const interval = setInterval(async () => {
      try {
        const sub = await billingApi.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error refetching subscription:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoading(planName);
    setError(null);
    try {
      let email = profile?.business_email || user?.email || profile?.email;

      if (!email) {
        const promptedEmail = window.prompt('Please enter your email for the checkout receipt:');
        if (!promptedEmail || !promptedEmail.includes('@')) {
          setError('A valid email is required to proceed with the checkout.');
          setLoading(null);
          return;
        }
        email = promptedEmail;
      }

      const { url } = await billingApi.createCheckoutSession(priceId, email);
      if (url) {
        window.location.href = url;
      }
    } catch (error: unknown) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const getDefaultDescription = (name: string) => {
    if (name === 'Starter') return 'Perfect for solo professionals. Your 24/7 AI Receptionist.';
    if (name === 'Professional') return 'For growing teams. Scale with advanced AI capabilities.';
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
      '1,000 AI minutes included',
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

  const getDisplayPlans = (): GroupedPlan[] => {
    const planDesignInfo: Record<string, { icon: React.FC<{ className?: string; size?: number; strokeWidth?: number }>; popular: boolean; color: string }> = {
      'Starter': { icon: Zap, popular: false, color: 'blue' },
      'Professional': { icon: Star, popular: true, color: 'indigo' },
      'Elite': { icon: Crown, popular: false, color: 'violet' },
    };

    if (plansData.length > 0) {
      const groupedPlans: Record<string, GroupedPlan> = {};

      plansData.forEach(plan => {
        const design = planDesignInfo[plan.name] || { icon: Star, popular: false, color: 'slate' };
        if (!groupedPlans[plan.name]) {
          groupedPlans[plan.name] = {
            name: plan.name,
            description: plan.description || getDefaultDescription(plan.name),
            features: plan.features || getDefaultFeatures(plan.name),
            monthlyPrice: 0,
            annualPrice: 0,
            monthlyPriceId: '',
            annualPriceId: '',
            current: false,
            icon: design.icon,
            popular: design.popular,
            color: design.color,
            originalMonthlyPrice: 0,
            stripe_price_id: '',
            cta: '',
          };
        }

        if (plan.interval === 'month') {
          groupedPlans[plan.name].monthlyPrice = plan.price_amount / 100;
          groupedPlans[plan.name].monthlyPriceId = plan.stripe_price_id || '';
          groupedPlans[plan.name].originalMonthlyPrice = plan.name === 'Starter' ? 99 : plan.name === 'Professional' ? 169 : 0;
        } else if (plan.interval === 'year') {
          groupedPlans[plan.name].annualPrice = (plan.price_amount / 100) / 12;
          groupedPlans[plan.name].annualPriceId = plan.stripe_price_id || '';
        }

        if (plan.id === subscription?.plan || plan.stripe_price_id === subscription?.stripe_price_id) {
          groupedPlans[plan.name].current = true;
          groupedPlans[plan.name].currentInterval = plan.interval;
        }
      });

      return Object.values(groupedPlans)
        .filter(plan => plan.name !== 'Elite')
        .map(plan => ({
          ...plan,
          cta: plan.current ? 'Current Plan' : `Get ${plan.name}`,
          stripe_price_id: isAnnual ? (plan.annualPriceId || plan.monthlyPriceId) : (plan.monthlyPriceId || plan.annualPriceId),
          monthlyPrice: plan.monthlyPrice || plan.annualPrice * 1.2,
          annualPrice: plan.annualPrice || plan.monthlyPrice * 0.8,
        }));
    }

    // Fallback static plans
    return [
      {
        name: 'Starter',
        description: 'Perfect for solo professionals. Your 24/7 AI Receptionist.',
        monthlyPrice: 69,
        originalMonthlyPrice: 99,
        annualPrice: 59,
        monthlyPriceId: 'price_starter',
        annualPriceId: '',
        features: getDefaultFeatures('Starter'),
        cta: 'Get Starter',
        current: false,
        icon: Zap,
        popular: false,
        color: 'blue',
        stripe_price_id: 'price_starter',
        promoText: 'First 3 months locked at this price!'
      },
      {
        name: 'Professional',
        description: 'For growing teams. Scale with advanced AI capabilities.',
        monthlyPrice: 118,
        originalMonthlyPrice: 169,
        annualPrice: 99,
        monthlyPriceId: 'price_pro',
        annualPriceId: '',
        features: getDefaultFeatures('Professional'),
        cta: 'Get Professional',
        current: false,
        icon: Star,
        popular: true,
        color: 'indigo',
        stripe_price_id: 'price_pro',
        promoText: 'First 3 months locked at this price!'
      }
    ];
  };

  const currentPlanName = subscription?.plan_name || '';
  const isOnProfessional = currentPlanName === 'Professional';
  const plans = getDisplayPlans();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} className="text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Error */}
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
                className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors w-fit group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Plan</h1>
                  <p className="text-slate-500 text-sm font-medium mt-2">
                    {isOnProfessional
                      ? "You're on the best standard plan. All features unlocked."
                      : 'Simple, transparent pricing. Upgrade or downgrade anytime.'
                    }
                  </p>
                </div>

                {/* Billing Toggle */}
                {!isOnProfessional && (
                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm h-fit">
                    <button
                      onClick={() => setIsAnnual(false)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all",
                        !isAnnual
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsAnnual(true)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                        isAnnual
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      Annual
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md uppercase">
                        -40%
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Plans Grid */}
            {isOnProfessional ? (
              /* Already on Professional — show confirmation */
              <div className="flex flex-col items-center justify-center py-16 px-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Shield size={32} className="text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">You're on the Professional Plan</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto text-sm">
                    All features are unlocked and your AI is running at full capacity. No upgrade needed.
                  </p>
                </div>
                <div className="flex items-center gap-6 py-3 px-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="text-sm font-black text-emerald-600">Active</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Billing</span>
                    <span className="text-sm font-black text-slate-900">
                      {subscription?.next_billing ? new Date(subscription.next_billing).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6 pt-2",
                plans.length === 1 ? "max-w-lg mx-auto" : "md:grid-cols-2"
              )}>
                {plans.map((plan) => {
                  const displayPrice = Math.round(isAnnual ? plan.annualPrice : plan.monthlyPrice);
                  const Icon = plan.icon;
                  const isCurrent = plan.current;
                  const savingsPercent = plan.originalMonthlyPrice > 0
                    ? Math.round(((plan.originalMonthlyPrice - plan.monthlyPrice) / plan.originalMonthlyPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "relative rounded-2xl transition-all duration-300",
                        plan.popular && !isCurrent
                          ? "ring-2 ring-blue-600 shadow-xl shadow-blue-100"
                          : "border border-slate-200 shadow-sm hover:shadow-md"
                      )}
                    >
                      {/* Badge */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                          <Check size={10} strokeWidth={3} />
                          Current Plan
                        </div>
                      )}
                      {!isCurrent && plan.popular && (
                        <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                          <Star size={10} className="fill-current" />
                          Most Popular
                        </div>
                      )}

                      <div className="bg-white rounded-2xl p-7 h-full flex flex-col">
                        {/* Plan Header */}
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-2.5 mb-1">
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center",
                                plan.popular ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                              )}>
                                <Icon size={18} strokeWidth={2} />
                              </div>
                              <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                            </div>
                            <p className="text-slate-500 text-xs font-medium mt-1">{plan.description}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 pb-6 border-b border-slate-100">
                          {!isAnnual && savingsPercent > 0 && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-slate-300 line-through">
                                ${plan.originalMonthlyPrice}
                              </span>
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase rounded border border-emerald-100">
                                Save {savingsPercent}%
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">${displayPrice}</span>
                            <span className="text-slate-400 font-semibold text-sm ml-1">/month</span>
                          </div>
                          {isAnnual && (
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">
                              Billed annually (${Math.round(plan.annualPrice * 12)}/yr)
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-7 flex-grow">
                          {plan.features.map((feature: string) => (
                            <div key={feature} className="flex items-start gap-2.5">
                              <div className={cn(
                                "w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                plan.popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                              )}>
                                <Check size={10} strokeWidth={3} />
                              </div>
                              <span className="text-sm text-slate-600 font-medium leading-snug">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <button
                          disabled={isCurrent || loading === plan.name}
                          onClick={() => handleUpgrade(plan.stripe_price_id, plan.name)}
                          className={cn(
                            "w-full rounded-xl h-12 text-sm font-bold transition-all flex items-center justify-center gap-2",
                            isCurrent
                              ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default"
                              : plan.popular
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]"
                                : "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 active:scale-[0.98]"
                          )}
                        >
                          {loading === plan.name ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isCurrent ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              Current Plan
                            </>
                          ) : (
                            plan.cta
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Enterprise Section */}
            <div className="mt-6 bg-slate-900 rounded-2xl overflow-hidden">
              <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2.5">
                    <Shield size={18} className="text-white/70" />
                    <h4 className="text-base font-black text-white tracking-tight">Enterprise</h4>
                  </div>
                  <p className="text-sm font-medium text-white/60 max-w-lg leading-relaxed">
                    Need custom infrastructure, volume discounts, or dedicated onboarding? We build solutions for large agencies.
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = 'mailto:sales@vocalscale.com'}
                  className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm whitespace-nowrap active:scale-95"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;
