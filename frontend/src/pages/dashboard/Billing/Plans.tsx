import React, { useState, useEffect } from 'react';
import { Check, PhoneCall, Star, Shield, ArrowLeft, Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { PageHeader } from '../../../components/ui/PageHeader';
import { PAGE_CONTAINER } from '../../../constants/layout';
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

  // The pricing shown here is UI-owned so it is always correct regardless of
  // what the billing API returns. The API is consulted only for the live
  // Stripe price id (checkout) and to detect the user's current plan.
  const getDisplayPlans = () => {
    const currentPlanName = subscription?.plan_name || '';

    const priceIdFor = (name: string, fallback: string) => {
      const match = plansData.find(
        (p) => p.name === name && p.interval === (isAnnual ? 'year' : 'month')
      );
      return match?.stripe_price_id || fallback;
    };

    const catalog = [
      {
        name: 'Starter',
        description: 'For solo pros & small teams. A 24/7 agent that never misses a call.',
        monthlyPrice: 399,
        originalMonthlyPrice: 499,
        annualPrice: 319,
        features: getDefaultFeatures('Starter'),
        icon: PhoneCall,
        popular: false,
        color: 'blue',
        stripe_price_id: priceIdFor('Starter', 'price_starter'),
        promoText: 'Replaces a $3,000/mo receptionist — answers every call, day or night.',
        contactUs: false,
      },
      {
        name: 'Professional',
        description: 'For growing teams. Capture every lead, book more, and scale without hiring.',
        monthlyPrice: 999,
        originalMonthlyPrice: 1299,
        annualPrice: 799,
        features: getDefaultFeatures('Professional'),
        icon: Star,
        popular: true,
        color: 'indigo',
        stripe_price_id: priceIdFor('Professional', 'price_pro'),
        promoText: 'Most popular for multi-location & high-volume teams.',
        contactUs: false,
      },
    ];

    return catalog
      .filter((plan) => {
        // On Starter → only show Professional as the upgrade.
        if (currentPlanName === 'Starter') return plan.name === 'Professional';
        // On Professional → nothing to upgrade (render shows the active state).
        if (currentPlanName === 'Professional') return false;
        // No subscription / trial → show both.
        return true;
      })
      .map((plan) => {
        const current = plan.name === currentPlanName;
        return {
          ...plan,
          current,
          cta: current ? 'Current Plan' : `Upgrade to ${plan.name}`,
        };
      });
  };

  const getDefaultFeatures = (name: string) => {
    if (name === 'Starter') return [
      '750 AI minutes included (~250 calls)',
      'Extra minutes: $0.089/min',
      '24/7 call answering & smart routing',
      'Appointment booking with Google Calendar sync',
      'Natural AI voices in 7 languages',
      'Call transcripts, summaries & recordings',
      '1 local phone number',
      'Email support'
    ];
    if (name === 'Professional') return [
      'Everything in Starter, plus:',
      '2,500 AI minutes included (~830 calls)',
      'Extra minutes: $0.079/min',
      'Premium HD voices — ultra-natural & low-latency',
      'Custom knowledge base trained on your business',
      'Up to 5 phone numbers',
      'Sentiment analysis & lead scoring',
      'Multiple agents and phone-number assignments',
      'Performance insights and call outcome reporting',
      'Priority 24/7 support'
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
      <div className={PAGE_CONTAINER}>

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <Loader2 size={32} className="text-slate-900 animate-spin" />
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-rose-600" />
                  <p className="text-rose-700 text-sm font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Header */}
              <button
                onClick={() => navigate('/dashboard/billing')}
                className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={15} /> Back to billing
              </button>

              <PageHeader
                title="Plans"
                description="Choose the plan that fits your call volume. Change or cancel anytime."
                actions={
                <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                  <span className={cn("text-xs font-semibold transition-colors", !isAnnual ? "text-slate-900" : "text-slate-400")}>Monthly</span>
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
                    <span className={cn("text-xs font-semibold transition-colors", isAnnual ? "text-slate-900" : "text-slate-400")}>Annual</span>
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                      Save up to 40%
                    </span>
                  </div>
                </div>
                }
              />

            {plans.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "group relative p-1 rounded-[1.75rem] transition-all duration-500",
                      plan.popular ? "bg-gradient-to-b from-blue-200 to-blue-200 shadow-xl shadow-blue-200/50" : "bg-transparent border border-transparent",
                      plan.current && "opacity-75" // Lock UI simple
                    )}
                  >
                    <div className={cn(
                      "relative bg-white rounded-xl p-6 h-full flex flex-col border",
                      plan.popular ? "border-white/50" : "border-slate-200 shadow-lg shadow-slate-200/50"
                    )}>
                      {plan.current && (
                        <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-lg">
                          <Shield size={12} />
                          Active Subscription
                        </div>
                      )}

                      {!plan.current && plan.popular && (
                        <div className="absolute top-0 right-12 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/30">
                          <Star className="w-3 h-3 fill-current" />
                          Most Popular
                        </div>
                      )}

                      <div className="mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-500 bg-white border border-slate-100 shadow-sm",
                          plan.popular ? "text-blue-600" : "text-slate-400"
                        )}>
                          <plan.icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-1">{plan.name}</h3>
                        <p className="text-slate-600 font-medium text-xs leading-relaxed">{plan.description}</p>
                      </div>

                      <div className="mb-5">
                        <div className="flex flex-col gap-1">
                          {!isAnnual && !!plan.originalMonthlyPrice && plan.originalMonthlyPrice > plan.monthlyPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-400 line-through decoration-slate-400/50 decoration-2">
                                ${plan.originalMonthlyPrice}
                              </span>
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[11px] font-semibold uppercase rounded border border-emerald-200">
                                {Math.round((1 - plan.monthlyPrice / plan.originalMonthlyPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-semibold text-slate-900 tracking-tighter">$</span>
                            <span className="text-4xl font-semibold text-slate-900 tracking-tighter">
                              {Math.round(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                            </span>
                            <span className="text-slate-500 font-semibold ml-1 text-sm">/mo</span>
                          </div>
                        </div>

                        {isAnnual && !plan.contactUs && (
                          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mt-1">Billed annually</p>
                        )}
                      </div>

                      <div className="space-y-2.5 mb-5 flex-grow">
                        {plan.features.map((feature: string) => (
                          <div key={feature} className="flex items-start gap-2.5">
                            <div className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                              plan.popular ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                            )}>
                              <Check className="w-2.5 h-2.5 stroke-[3px]" />
                            </div>
                            <span className="text-[13px] font-medium text-slate-600 leading-snug">{feature}</span>
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
                          "w-full rounded-xl h-12 text-[11px] font-semibold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2",
                          plan.current
                            ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default"
                            : plan.popular
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-slate-900/20"
                        )}
                      >
                        {loading === plan.name ? <Loader2 size={16} className="animate-spin" /> : plan.cta}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Enterprise — sits beside the plans, custom/contact */}
                <div className="group relative p-1 rounded-[1.75rem]">
                  <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-6 h-full flex flex-col border border-slate-900 shadow-lg shadow-slate-900/20">
                    <div className="mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white/10 text-white border border-white/10">
                        <Shield className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight mb-1">Enterprise</h3>
                      <p className="text-white/60 font-medium text-xs leading-relaxed">Maximum power for high-volume businesses and agencies.</p>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold tracking-tighter">Custom</span>
                      </div>
                      <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mt-1">Tailored to your volume</p>
                    </div>

                    <div className="space-y-2.5 mb-5 flex-grow">
                      {getDefaultFeatures('Elite').map((feature: string) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/10 text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3px]" />
                          </div>
                          <span className="text-[13px] font-medium text-white/80 leading-snug">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => { window.location.href = 'mailto:sales@vocalscale.com'; }}
                      className="w-full rounded-xl h-12 text-[11px] font-semibold uppercase tracking-wider transition-all active:scale-95 bg-white text-slate-900 hover:bg-white/90 flex items-center justify-center gap-2"
                    >
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            ) : subscription?.status === 'active' ? (
              <div className="flex flex-col items-center justify-center py-20 px-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield size={40} className="text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">You're on the Professional plan</h3>
                  <p className="text-slate-600 font-medium max-w-md mx-auto">
                    You're currently using our most powerful standard plan. All features are unlocked for your agents.
                  </p>
                </div>
                <div className="flex items-center gap-4 py-3 px-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Status</span>
                    <span className="text-sm font-semibold text-emerald-600 uppercase">Active & Secured</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 mx-2" />
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Next Billing</span>
                    <span className="text-sm font-semibold text-slate-900 uppercase">
                      {subscription.next_billing ? new Date(subscription.next_billing).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;
