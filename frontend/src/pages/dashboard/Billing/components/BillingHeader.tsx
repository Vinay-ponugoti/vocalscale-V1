import React, { useEffect, useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { billingApi } from '../../../../api/billing';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '../../../../components/ui/Badge';

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

  const cycleStart = isActive && subscription?.current_period_start
    ? format(new Date(subscription.current_period_start * 1000), 'MMM d')
    : format(startOfMonth(new Date()), 'MMM d');

  const cycleEnd = isActive && subscription?.current_period_end
    ? format(new Date(subscription.current_period_end * 1000), 'MMM d')
    : format(endOfMonth(new Date()), 'MMM d');

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-2">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] font-black tracking-[0.2em] text-blue-600 border-blue-100 bg-blue-50 px-2 py-0.5 rounded uppercase">
            Billing & Usage
          </Badge>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-charcoal">
          Overview
        </h1>
        <p className="text-charcoal-light text-sm font-medium mt-1 max-w-xl leading-relaxed">
          Manage subscription, monitor real-time usage, and view history.
        </p>
      </div>

      <div className="flex items-center gap-6 bg-white px-5 py-3 rounded-xl border-none shadow-lg shadow-charcoal/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">Cycle</span>
          <span className="text-xs font-black text-charcoal tracking-tight">{cycleStart} — {cycleEnd}</span>
        </div>
        <div className="h-8 w-px bg-white-light"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">Status</span>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="animate-spin text-charcoal-light" size={12} />
            ) : (
              <>
                <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isActive ? status : 'INACTIVE'}
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
