import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Shield, ArrowLeft, Crown, Loader2, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { billingApi } from '../../../api/billing';

const Plans: React.FC = () => {
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
  }, []);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoading(planName);
    setError(null);
    try {
      const { url } = await billingApi.createCheckoutSession(priceId);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      // Enhanced error handling (Phase 1 Rule 4)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  // Static design info for the plans (icons, psychology labels, etc.)
  const planDesignInfo: Record<string, any> = {
    'Starter': { icon: Zap, psychology: 'Essential' },
    'Professional': { icon: Star, psychology: 'Standard' },
    'Elite': { icon: Crown, psychology: 'Ultimate' },
  };

  const getDisplayPlans = () => {
    const currentPlanId = subscription?.plans?.id;

    if (plansData.length > 0) {
      // Group plans by name to handle monthly/annual pairs
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
        } else if (plan.interval === 'year') {
          groupedPlans[plan.name].annualPrice = (plan.price_amount / 100) / 12; // Display as per month
          groupedPlans[plan.name].annualPriceId = plan.stripe_price_id;
        }

        if (plan.id === currentPlanId) {
          groupedPlans[plan.name].current = true;
          groupedPlans[plan.name].currentInterval = plan.interval;
        }
      });

      return Object.values(groupedPlans).map(plan => ({
        ...plan,
        cta: plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`,
        stripe_price_id: isAnnual ? (plan.annualPriceId || plan.monthlyPriceId) : (plan.monthlyPriceId || plan.annualPriceId),
        // Fallback pricing if one is missing
        monthlyPrice: plan.monthlyPrice || plan.annualPrice * 1.2,
        annualPrice: plan.annualPrice || plan.monthlyPrice * 0.8,
      }));
    }

    // Fallback to hardcoded plans if API fails or is empty
    return [
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
        cta: 'Upgrade to Starter',
        current: false,
        icon: Zap,
        psychology: 'Essential',
        stripe_price_id: 'price_starter'
      },
      {
        name: 'Professional',
        description: 'Perfect for growing teams and multi-location businesses.',
        monthlyPrice: 129,
        annualPrice: 99,
        features: [
          '1,000 AI minutes included',
          'Advanced calendar sync',
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
        psychology: 'Standard',
        stripe_price_id: 'price_pro'
      },
      {
        name: 'Elite',
        description: 'Maximum power for high-volume businesses and agencies.',
        monthlyPrice: 299,
        annualPrice: 250,
        features: [
          '3,000 AI minutes included',
          'Dedicated account manager',
          'Custom voice cloning',
          'API access & webhooks',
          'White-label options',
          'Unlimited phone numbers',
          'Advanced analytics dashboard',
          'Custom CRM development'
        ],
        cta: 'Upgrade to Elite',
        current: false,
        icon: Crown,
        psychology: 'Ultimate',
        stripe_price_id: 'price_elite'
      }
    ];
  };

  const getDefaultDescription = (name: string) => {
    if (name === 'Starter') return 'Ideal for solo practitioners and small local businesses.';
    if (name === 'Professional') return 'Perfect for growing teams and multi-location businesses.';
    if (name === 'Elite') return 'Maximum power for high-volume businesses and agencies.';
    return 'Scale your business with the right AI capabilities.';
  };

  const getDefaultFeatures = (name: string) => {
    if (name === 'Starter') return [
      '300 AI minutes included',
      'Basic appointment scheduling',
      'Standard AI voice models',
      'Email support',
      'Call history & transcripts',
      '1 Local phone number'
    ];
    if (name === 'Professional') return [
      '1,000 AI minutes included',
      'Advanced calendar sync',
      'Premium HD voice models',
      'Priority 24/7 support',
      'Custom knowledge base',
      'Up to 5 phone numbers',
      'Sentiment analysis',
      'CRM integrations'
    ];
    if (name === 'Elite') return [
      '3,000 AI minutes included',
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
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-6 2xl:p-10 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50/30">

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-red-900 tracking-tight">Checkout Error</h4>
                    <p className="text-red-600/80 text-xs font-medium">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-2 hover:bg-red-100 rounded-xl transition-colors text-red-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-5">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Select Plan</h1>
                  <p className="text-slate-500 text-sm font-medium mt-1">Upgrade your AI capabilities instantly.</p>
                </div>

                {/* Toggle */}
                <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-5 py-2.5 rounded-xl transition-all duration-300 text-[11px] font-black uppercase tracking-widest ${!isAnnual
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-5 py-2.5 rounded-xl transition-all duration-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${isAnnual
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Annual
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isAnnual ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-6 items-stretch pt-4">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`group relative flex flex-col p-8 rounded-[32px] transition-all duration-500 border-2 ${plan.current
                    ? 'bg-white border-blue-600 shadow-xl shadow-blue-100 ring-4 ring-blue-50'
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1'
                    }`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-20">
                      Current Active Plan
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${plan.current ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                        {plan.psychology}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {plan.name}
                      </h3>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${plan.current
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                      <plan.icon size={22} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                      ${Math.round(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                    </span>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold text-slate-400">/mo</span>
                      {isAnnual && (
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight mt-0.5">Billed Yearly</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                    {plan.description}
                  </p>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${plan.current
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-600 tracking-tight leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={plan.current || loading === plan.name}
                    onClick={() => handleUpgrade(plan.stripe_price_id, plan.name)}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${plan.current
                      ? 'bg-slate-100 text-slate-400 cursor-default shadow-none'
                      : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200 hover:scale-[1.02]'
                      }`}
                  >
                    {loading === plan.name && <Loader2 size={16} className="animate-spin" />}
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Enterprise Section - Clean */}
            <div className="mt-8 rounded-[32px] bg-slate-50 border border-slate-200 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-slate-300 transition-all">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                    <Shield size={20} />
                  </div>
                  <h4 className="text-xl font-black tracking-tight text-slate-900">Enterprise Scale</h4>
                </div>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Need a custom solution? We offer dedicated infrastructure, volume discounts, and white-glove onboarding for large agencies.
                </p>
              </div>

              <button className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all whitespace-nowrap">
                Contact Enterprise Sales
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Plans;
