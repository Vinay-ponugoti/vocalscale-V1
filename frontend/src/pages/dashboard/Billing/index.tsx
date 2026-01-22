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

const Billing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stats State
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const checkSubscription = useCallback(async (signal: AbortSignal): Promise<boolean> => {
    try {
      const sub = await billingApi.getSubscription();
      return sub && sub.status === 'active';
    } catch (error) {
      if (error.name === 'AbortError') throw error;
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
          const isActive = await checkSubscription(abortControllerRef.current!.signal);
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
  const plan = subscription?.plan || { name: 'NO ACTIVE PLAN', price_amount: 0, limits: { ai_minutes: 0 } };
  const status = subscription?.status || 'inactive';
  const cycleStart = hasSubscription && subscription?.current_period_start
    ? format(new Date(subscription.current_period_start * 1000), 'MMM d')
    : format(startOfMonth(new Date()), 'MMM d');
  const cycleEnd = hasSubscription && subscription?.current_period_end
    ? format(new Date(subscription.current_period_end * 1000), 'MMM d')
    : format(endOfMonth(new Date()), 'MMM d');

  const totalMinutes = hasSubscription ? (usage?.total_minutes || plan.limits?.ai_minutes || 0) : 0;
  const usedMinutes = hasSubscription ? (usage?.used_minutes || 0) : 0;
  // const remainingMinutes = hasSubscription ? (usage?.remaining_minutes || 0) : 0;
  const remainingPercentage = totalMinutes > 0 ? Math.min(100, Math.max(0, Math.round(((totalMinutes - usedMinutes) / totalMinutes) * 100))) : 0;
  const overageMinutes = Math.max(0, usedMinutes - totalMinutes);


  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col h-full bg-slate-50/50 p-4 md:p-6 2xl:p-8 overflow-hidden">

        {/* Unified Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden w-full max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">

          {/* Top Bar: Integrated Stats (Plan & Usage) */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-8 bg-white shrink-0 overflow-x-auto no-scrollbar">
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

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{plan.name}</span>
                  <Link to="/dashboard/billing/plans" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors">
                    Upgrade <ChevronRight size={10} />
                  </Link>
                </div>
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

          </div>

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
            <div className="max-w-7xl mx-auto space-y-8 pb-10">

              {/* Notifications */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
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
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                  <XCircle size={20} className="text-amber-500" />
                  <span className="text-sm font-bold">Payment canceled. No changes were made to your plan.</span>
                </div>
              )}

              {/* Usage Section */}
              <div>
                <UsageBreakdown hasSubscription={hasSubscription} usage={usage} />
              </div>

              <div className="w-full h-px bg-slate-100 my-8" />

              {/* Billing & Payment Grid */}
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <BillingHistory />
                </div>

                <div className="flex flex-col gap-6">
                  <PaymentMethod />
                  <UpsellCard />
                </div>
              </div>

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
