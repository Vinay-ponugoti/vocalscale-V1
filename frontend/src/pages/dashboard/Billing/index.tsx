import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import UsageBreakdown from './components/UsageBreakdown';
import BillingHistory from './components/BillingHistory';
import PaymentMethod from './components/PaymentMethod';
import UpsellCard from './components/UpsellCard';
import { CheckCircle2, XCircle, Loader2, Star, Clock, PhoneCall, ChevronRight } from 'lucide-react';
import { billingApi } from '../../../api/billing';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Subscription {
  status: string;
  plan_name?: string;
  plan?: { name?: string; price_amount?: number; limits?: { ai_minutes?: number } };
  plan_id?: string;
  current_period_start?: number | string;
  current_period_end?: number | string;
  period_start?: number | string;
  period_end?: number | string;
  next_billing?: number | string;
  trial_ends_at?: number | string;
}

interface UsageData {
  total_minutes?: number;
  minutes_limit?: number;
  used_minutes?: number;
  minutes_used?: number;
}

const Billing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'payment'>('overview');

  // Stats State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [, setLoadingStats] = useState(true);

  const checkSubscription = useCallback(async (): Promise<boolean> => {
    try {
      const sub = await billingApi.getSubscription();
      return sub && sub.status === 'active';
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      console.error('Error checking subscription:', error);
      return false;
    }
  }, []);

  // Fetch Billing Stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, usageData] = await Promise.all([
          billingApi.getSubscription(),
          billingApi.getUsage()
        ]);
        setSubscription(subData);
        setUsage(usageData);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [subscribed]); // Refetch when subscription status changes

  useEffect(() => {
    if (success) {
      setIsPolling(true);
      setPollCount(0);
      setSubscribed(false);
      let pollInterval: NodeJS.Timeout | null = null;
      const maxAttempts = 10;
      const initialDelay = 5000;
      const maxDelay = 60000;

      const pollWithBackoff = async (attempt: number) => {
        if (attempt >= maxAttempts || subscribed || abortControllerRef.current?.signal.aborted) {
          setIsPolling(false);
          if (subscribed || abortControllerRef.current?.signal.aborted) {
            const timer = setTimeout(() => setSearchParams({}), 5000);
            return () => clearTimeout(timer);
          }
          return;
        }

        setPollCount(attempt);
        const delay = Math.min(initialDelay * Math.pow(1.5, attempt), maxDelay);

        try {
          const isActive = await checkSubscription();
          if (isActive) {
            setSubscribed(true);
            setIsPolling(false);
            const timer = setTimeout(() => setSearchParams({}), 5000);
            return () => clearTimeout(timer);
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') return;
          console.error('Polling error:', error);
        }

        pollInterval = setTimeout(() => pollWithBackoff(attempt + 1), delay);
      };

      abortControllerRef.current = new AbortController();
      pollWithBackoff(0);

      return () => {
        if (pollInterval) clearTimeout(pollInterval);
        abortControllerRef.current?.abort();
      };
    }

    if (canceled) {
      const timer = setTimeout(() => setSearchParams({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, setSearchParams, subscribed, checkSubscription]);

  // Derived Values for Top Bar
  const hasSubscription = subscription && subscription.status === 'active';
  const planName = subscription?.plan_name || subscription?.plan?.name || (subscription?.plan_id ? 'Starter' : 'NO ACTIVE PLAN');
  const plan = subscription?.plan || { name: planName, price_amount: 0, limits: { ai_minutes: 0 } };
  const normalizedPlan = planName?.toLowerCase();
  const isProfessional = normalizedPlan === 'professional';
  const isStarter = normalizedPlan === 'starter';
  const isNoPlan = normalizedPlan === 'no active plan';

  // Helper to parse dates from various formats (Stripe unix seconds or RFC3339)
  const parseBillingDate = (dateVal: string | number | null | undefined) => {
    if (!dateVal) return null;
    if (typeof dateVal === 'number') return new Date(dateVal * 1000);
    try {
      return new Date(dateVal);
    } catch {
      return null;
    }
  };

  const periodStart = parseBillingDate(subscription?.current_period_start || subscription?.period_start);
  const periodEnd = parseBillingDate(subscription?.current_period_end || subscription?.period_end || subscription?.next_billing || subscription?.trial_ends_at);

  const cycleStart = periodStart ? format(periodStart, 'MMM d') : format(startOfMonth(new Date()), 'MMM d');
  const cycleEnd = periodEnd ? format(periodEnd, 'MMM d') : format(endOfMonth(new Date()), 'MMM d');

  // Usage Calculation: Should show data if usage object exists, even if subscription is "inactive" (e.g. trial or recently expired)
  const totalMinutes = usage?.total_minutes || usage?.minutes_limit || plan.limits?.ai_minutes || 0;
  const usedMinutes = usage?.used_minutes || usage?.minutes_used || 0;
  const remainingPercentage = totalMinutes > 0 ? Math.min(100, Math.max(0, Math.round(((totalMinutes - usedMinutes) / totalMinutes) * 100))) : 0;
  const overageMinutes = Math.max(0, usedMinutes - (totalMinutes || 0));

  const mobileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' },
    { id: 'payment', label: 'Payment' },
  ] as const;


  return (
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full custom-scrollbar">

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex-none bg-white border-b border-slate-200 p-2 z-10 sticky top-0">
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            {mobileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Bar: Integrated Stats (Plan & Usage) - Desktop Only or Mobile Overview */}
        <div className={`w-full bg-white px-8 py-5 rounded-3xl border border-slate-100 shadow-sm shrink-0 overflow-x-auto no-scrollbar ${activeTab === 'overview' ? 'flex' : 'hidden md:flex'} items-center gap-8`}>
          {/* Plan Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-500/10">
              <Star size={16} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Plan</p>
                {hasSubscription && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                )}
              </div>
              <span className="text-sm font-black text-slate-900">{planName}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100" />

          {/* Cycle Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-500/10">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Billing Cycle</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{cycleStart} - {cycleEnd}</span>
                {!hasSubscription && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">(No Plan)</span>}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100" />

          {/* Usage Stats */}
          <div className="flex items-center gap-3 shrink-0 min-w-[200px]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${overageMinutes > 0 ? 'bg-amber-50 text-amber-600 ring-amber-500/10' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
              <PhoneCall size={16} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minutes Usage</p>
                <span className={`text-[10px] font-black ${overageMinutes > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {usedMinutes} / {totalMinutes}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${overageMinutes > 0 ? 'bg-amber-500' :
                    remainingPercentage < 20 ? 'bg-rose-500' :
                      'bg-blue-600'
                    }`}
                  style={{ width: `${Math.min(100, (usedMinutes / (totalMinutes || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {overageMinutes > 0 && (
            <>
              <div className="h-8 w-px bg-slate-100" />
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider">Overage: {overageMinutes}m</span>
                </div>
              </div>
            </>
          )}

          {/* Upgrade Button - pushed to right */}
          {!isProfessional && (
            <div className="ml-auto shrink-0">
              <Link
                to="/dashboard/billing/plans"
                className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center gap-2 no-underline"
              >
                Upgrade <ChevronRight size={10} strokeWidth={3} />
              </Link>
            </div>
          )}

        </div>

        {/* Main Content Area */}
        <div className="w-full space-y-8 pb-10">

          {/* Notifications */}
          {(success || canceled) && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center justify-between gap-3 shadow-sm mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-sm font-bold">
                      {isPolling
                        ? `Payment received! Checking subscription status (attempt ${pollCount + 1}/10)...`
                        : subscribed
                          ? "Subscription activated successfully!"
                          : "Payment received. Please check back in a few minutes."
                      }
                    </span>
                  </div>
                  {isPolling && <Loader2 size={18} className="text-emerald-500 animate-spin" />}
                </div>
              )}

              {canceled && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm mb-6">
                  <XCircle size={20} className="text-amber-500" />
                  <span className="text-sm font-bold">Payment canceled. No changes were made to your plan.</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: Overview Tab | Desktop: Always Show */}
          <div className={`${activeTab === 'overview' ? 'block' : 'hidden md:block'}`}>
            <UsageBreakdown hasSubscription={hasSubscription} usage={usage} />
          </div>

          <div className="hidden md:block w-full h-px bg-slate-100 my-8" />

          {/* Billing & Payment Grid */}
          <div className={`grid gap-8 lg:grid-cols-3 ${activeTab === 'overview' ? 'hidden md:grid' : ''}`}>

            {/* Mobile: History Tab | Desktop: Col Span 2 */}
            <div className={`lg:col-span-2 ${activeTab === 'history' ? 'block' : 'hidden md:block'}`}>
              <BillingHistory />
            </div>

            {/* Mobile: Payment Tab | Desktop: Col Span 1 */}
            <div className={`flex flex-col gap-6 ${activeTab === 'payment' ? 'block' : 'hidden md:flex'}`}>
              <PaymentMethod />
              {(isStarter || isNoPlan) && <UpsellCard />}
            </div>
          </div>

        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E2E8F0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #CBD5E1;
            border-radius: 10px;
          }
           /* Hide Scrollbar for Horizontal Scroll Areas */
           .no-scrollbar::-webkit-scrollbar {
               display: none;
           }
           .no-scrollbar {
               -ms-overflow-style: none;
               scrollbar-width: none;
           }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
