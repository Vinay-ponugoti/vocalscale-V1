import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import BillingHeader from './components/BillingHeader';
import PlanOverview from './components/PlanOverview';
import UsageBreakdown from './components/UsageBreakdown';
import BillingHistory from './components/BillingHistory';
import PaymentMethod from './components/PaymentMethod';
import UpsellCard from './components/UpsellCard';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { billingApi } from '../../../api/billing';

const Billing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const abortControllerRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    if (success) {
      setIsPolling(true);
      setPollCount(0);
      setSubscribed(false);
      let pollInterval: NodeJS.Timeout | null = null;
      const maxAttempts = 10;
      const initialDelay = 5000; // Start at 5 seconds
      const maxDelay = 60000;    // Max 60 seconds

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

  return (
    <DashboardLayout fullWidth>
      <div className="w-full p-4 md:p-8 2xl:p-12 space-y-8 2xl:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto h-full custom-scrollbar">
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
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
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
            <XCircle size={20} className="text-amber-500" />
            <span className="text-sm font-bold">Payment canceled. No changes were made to your plan.</span>
          </div>
        )}

        <BillingHeader />

        <div className="flex flex-col gap-8 2xl:gap-12 pb-10">
          <PlanOverview />

          <UsageBreakdown />

          <div className="grid gap-8 2xl:gap-12 lg:grid-cols-3 2xl:grid-cols-4">
            <div className="lg:col-span-2 2xl:col-span-3">
              <BillingHistory />
            </div>

            <div className="flex flex-col gap-8">
              <PaymentMethod />
              <UpsellCard />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
