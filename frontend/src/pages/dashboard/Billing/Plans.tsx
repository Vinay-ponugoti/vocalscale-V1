import React, { useState, useEffect } from 'react';
import { Check, Zap, Star, Shield, ArrowLeft, Crown, Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    'Starter': { icon: Zap, psychology: 'Essential' },
    'Professional': { icon: Star, psychology: 'Standard' },
    'Elite': { icon: Crown, psychology: 'Ultimate' },
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
        cta: plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`,
        stripe_price_id: isAnnual ? (plan.annualPriceId || plan.monthlyPriceId) : (plan.monthlyPriceId || plan.annualPriceId),
        monthlyPrice: plan.monthlyPrice || plan.annualPrice * 1.2,
        annualPrice: plan.annualPrice || plan.monthlyPrice * 0.8,
      }));
    }

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
                <div className="inline-flex items-center p-1 bg-white-light rounded-xl border border-white-light/50">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-2 rounded-lg transition-all duration-300 text-[11px] font-black uppercase tracking-widest ${!isAnnual
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-charcoal-light hover:text-charcoal'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-lg transition-all duration-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${isAnnual
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-charcoal-light hover:text-charcoal'
                      }`}
                  >
                    Annual
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isAnnual ? 'bg-emerald-50 text-emerald-600' : 'bg-charcoal/5 text-charcoal-light'
                      }`}>
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-6 pt-4">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex flex-col border-none shadow-xl transition-all duration-300 ${plan.current
                    ? 'shadow-charcoal/10 ring-2 ring-charcoal'
                    : 'shadow-charcoal/5 hover:shadow-charcoal/10 hover:-translate-y-1'
                    }`}
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant={plan.current ? "secondary" : "outline"}
                        className={`font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider ${plan.current ? 'bg-charcoal text-white' : 'text-charcoal-light'
                          }`}
                      >
                        {plan.psychology}
                      </Badge>
                      {plan.current && (
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Check size={12} strokeWidth={4} /> Current
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-white-light/50 ${plan.current ? 'text-charcoal' : 'text-charcoal-light'}`}>
                          <plan.icon size={20} strokeWidth={2.5} />
                        </div>
                        <CardTitle className="text-xl font-black text-charcoal tracking-tight">
                          {plan.name}
                        </CardTitle>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-charcoal tracking-tighter">
                          ${Math.round(isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                        </span>
                        <span className="text-xs font-bold text-charcoal-light">/mo</span>
                      </div>

                      <CardDescription className="text-sm font-medium leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-8">
                    <div className="space-y-3.5">
                      {plan.features.map((feature: string) => (
                        <div key={feature} className="flex items-start gap-3 group">
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${plan.current ? 'bg-charcoal text-white' : 'bg-white-light text-charcoal-light group-hover:text-charcoal'
                            }`}>
                            <Check size={8} strokeWidth={4} />
                          </div>
                          <span className="text-[13px] font-medium text-charcoal-medium leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <button
                      disabled={plan.current || loading === plan.name}
                      onClick={() => handleUpgrade(plan.stripe_price_id, plan.name)}
                      className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${plan.current
                        ? 'bg-white-light text-charcoal-light cursor-default'
                        : 'bg-charcoal text-white hover:bg-charcoal-dark shadow-lg shadow-charcoal/20 hover:shadow-charcoal/30'
                        }`}
                    >
                      {loading === plan.name ? <Loader2 size={16} className="animate-spin" /> : plan.cta}
                    </button>
                  </CardFooter>
                </Card>
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
