import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import UsageBreakdown from './components/UsageBreakdown';
import UsageAlert from './components/UsageAlert';
import BillingHistory from './components/BillingHistory';
import PaymentMethod from './components/PaymentMethod';
import UpsellCard from './components/UpsellCard';
import { CheckCircle2, XCircle, Loader2, Star, Clock, PhoneCall, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { PAGE_CONTAINER, GRID_GAP } from '../../../constants/layout';
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
  remaining_minutes?: number;
  usage_percent?: number;
  calls_count?: number;
  total_calls?: number;
  avg_duration_seconds?: number;
  success_rate?: number;
  overage_minutes?: number;
  estimated_cost?: number;
  overage_rate?: number;
  billing_period?: string;
  billable_minutes?: number;
  inbound_minutes?: number;
  outbound_minutes?: number;
  inbound_calls?: number;
  outbound_calls?: number;
  pending_calls?: number;
  last_updated_at?: string;
}

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeUsage = (usage: UsageData | null, planLimit = 0): UsageData => {
  const totalMinutes = toNumber(usage?.total_minutes ?? usage?.minutes_limit, planLimit);
  const usedMinutes = toNumber(usage?.used_minutes ?? usage?.minutes_used, 0);
  const overageMinutes = toNumber(usage?.overage_minutes, Math.max(0, usedMinutes - totalMinutes));
  const usagePercent = totalMinutes > 0
    ? toNumber(usage?.usage_percent, (usedMinutes / totalMinutes) * 100)
    : 0;

  return {
    ...usage,
    total_minutes: totalMinutes,
    minutes_limit: totalMinutes,
    used_minutes: usedMinutes,
    minutes_used: usedMinutes,
    remaining_minutes: toNumber(usage?.remaining_minutes, Math.max(0, totalMinutes - usedMinutes)),
    usage_percent: Math.min(100, Math.max(0, usagePercent)),
    calls_count: toNumber(usage?.calls_count ?? usage?.total_calls, 0),
    total_calls: toNumber(usage?.total_calls ?? usage?.calls_count, 0),
    avg_duration_seconds: toNumber(usage?.avg_duration_seconds, 0),
    success_rate: toNumber(usage?.success_rate, usage?.total_calls || usage?.calls_count ? 0 : 100),
    overage_minutes: overageMinutes,
    estimated_cost: toNumber(usage?.estimated_cost, overageMinutes * 0.089),
    overage_rate: toNumber(usage?.overage_rate, 0.089),
    billable_minutes: toNumber(usage?.billable_minutes, usedMinutes),
    inbound_minutes: toNumber(usage?.inbound_minutes, 0),
    outbound_minutes: toNumber(usage?.outbound_minutes, 0),
    inbound_calls: toNumber(usage?.inbound_calls, 0),
    outbound_calls: toNumber(usage?.outbound_calls, 0),
    pending_calls: toNumber(usage?.pending_calls, 0),
  };
};

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

  const fetchBillingData = useCallback(async () => {
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
  }, []);

  // Fetch Billing Stats
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData, subscribed]); // Refetch when subscription status changes

  useEffect(() => {
    const refreshUsage = () => {
      if (document.visibilityState === 'visible') {
        fetchBillingData();
      }
    };

    const interval = window.setInterval(refreshUsage, 30000);
    window.addEventListener('focus', refreshUsage);
    document.addEventListener('visibilitychange', refreshUsage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUsage);
      document.removeEventListener('visibilitychange', refreshUsage);
    };
  }, [fetchBillingData]);

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
  const normalizedUsage = normalizeUsage(usage, plan.limits?.ai_minutes ?? 0);
  const totalMinutes = normalizedUsage.total_minutes ?? 0;
  const usedMinutes = normalizedUsage.used_minutes ?? 0;
  const remainingPercentage = totalMinutes > 0 ? Math.min(100, Math.max(0, Math.round(((totalMinutes - usedMinutes) / totalMinutes) * 100))) : 0;
  const overageMinutes = normalizedUsage.overage_minutes ?? 0;
  const usagePercentage = normalizedUsage.usage_percent ?? 0;

  const mobileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History' },
    { id: 'payment', label: 'Payment' },
  ] as const;


  return (
    <DashboardLayout>
      <div className={PAGE_CONTAINER}>
        <PageHeader
          title="Billing"
          description="Your plan, minutes used, invoices, and payment method."
          actions={
            <Button asChild variant={isProfessional ? 'outline' : 'default'}>
              <Link to="/dashboard/billing/plans" className="no-underline">
                {isProfessional ? 'View plans' : 'Upgrade plan'} <ArrowUpRight size={15} />
              </Link>
            </Button>
          }
        />

        {/* Mobile tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:hidden">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-colors ${activeTab === tab.id
                ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plan, cycle, and minutes at a glance */}
        <div className={`grid-cols-1 sm:grid-cols-3 ${GRID_GAP} ${activeTab === 'overview' ? 'grid' : 'hidden md:grid'}`}>
          <StatCard
            icon={Star}
            label="Current plan"
            value={planName}
            description={hasSubscription ? 'Active' : 'No active plan'}
          />
          <StatCard
            icon={Clock}
            tint="slate"
            label="Billing cycle"
            value={`${cycleStart} – ${cycleEnd}`}
            description={hasSubscription ? 'Current period' : 'No plan'}
          />
          <StatCard
            icon={PhoneCall}
            tint={overageMinutes > 0 ? 'amber' : 'emerald'}
            label="Minutes used"
            value={`${Math.round(usedMinutes)} / ${totalMinutes}`}
            description={
              <span className="flex w-full flex-col gap-1.5">
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full transition-all duration-1000 ${overageMinutes > 0 ? 'bg-amber-500' : remainingPercentage < 20 ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </span>
                {overageMinutes > 0
                  ? <span className="font-medium text-amber-700">Overage: {overageMinutes.toFixed(1)} min</span>
                  : <span>{(normalizedUsage.inbound_minutes ?? 0).toFixed(0)} inbound · {(normalizedUsage.outbound_minutes ?? 0).toFixed(0)} outbound</span>}
              </span>
            }
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full space-y-6">

          {/* Notifications */}
          {(success || canceled) && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              {success && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-sm font-medium">
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
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                  <XCircle size={20} className="text-amber-500" />
                  <span className="text-sm font-medium">Payment canceled. No changes were made to your plan.</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile: Overview Tab | Desktop: Always Show */}
          <div className={`${activeTab === 'overview' ? 'block' : 'hidden md:block'}`}>
            <div className="mb-4 lg:mb-6">
              <UsageAlert
                usedMinutes={normalizedUsage.used_minutes ?? normalizedUsage.minutes_used ?? 0}
                totalMinutes={normalizedUsage.total_minutes ?? normalizedUsage.minutes_limit ?? 0}
                overageMinutes={normalizedUsage.overage_minutes}
                estimatedCost={normalizedUsage.estimated_cost}
                billingPeriodStart={normalizedUsage.billing_period}
              />
            </div>
            <UsageBreakdown hasSubscription={hasSubscription} usage={normalizedUsage} />
          </div>

          {/* Billing & Payment Grid */}
          <div className={`grid lg:grid-cols-3 ${GRID_GAP} ${activeTab === 'overview' ? 'hidden md:grid' : ''}`}>

            {/* Mobile: History Tab | Desktop: Col Span 2 */}
            <div className={`lg:col-span-2 ${activeTab === 'history' ? 'block' : 'hidden md:block'}`}>
              <BillingHistory />
            </div>

            {/* Mobile: Payment Tab | Desktop: Col Span 1 */}
            <div className={`flex flex-col gap-4 lg:gap-6 ${activeTab === 'payment' ? 'block' : 'hidden md:flex'}`}>
              <PaymentMethod />
              {(isStarter || isNoPlan) && <UpsellCard />}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Billing;
