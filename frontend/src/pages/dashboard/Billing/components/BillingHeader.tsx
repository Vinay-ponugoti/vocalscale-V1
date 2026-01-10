import React, { useEffect, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const BillingHeader: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await billingApi.getSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const status = subscription?.status || 'inactive';
  const isActive = status === 'active';
  const hasPlan = !!subscription?.plans;
  
  // Use current month for billing cycle if not provided by Stripe
  const cycleStart = isActive && subscription?.current_period_start 
    ? format(new Date(subscription.current_period_start * 1000), 'MMM d')
    : format(startOfMonth(new Date()), 'MMM d');
    
  const cycleEnd = isActive && subscription?.current_period_end
    ? format(new Date(subscription.current_period_end * 1000), 'MMM d')
    : format(endOfMonth(new Date()), 'MMM d');

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-2">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center rounded-xl bg-blue-electric/10 p-1.5 shadow-sm ring-1 ring-blue-electric/20">
            <Zap className="text-blue-electric" size={16} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-blue-electric uppercase">Billing System</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-charcoal">
          Billing Overview
        </h1>
        <p className="text-charcoal-light text-sm font-medium mt-2 max-w-xl leading-relaxed">
          Manage your subscription plans, monitor your AI usage in real-time, and download your past invoices.
        </p>
      </div>
      
      <div className="flex items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Cycle</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-charcoal tracking-tight">{cycleStart} — {cycleEnd}</span>
          </div>
        </div>
        <div className="h-10 w-px bg-slate-100"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</span>
          <div className="flex items-center gap-2.5">
            {loading ? (
              <Loader2 className="animate-spin text-slate-300" size={14} />
            ) : (
              <>
                <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isActive ? status : 'NO ACTIVE PLAN'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHeader;
