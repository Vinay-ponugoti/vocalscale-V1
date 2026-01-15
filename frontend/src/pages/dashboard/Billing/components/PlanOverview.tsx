import React, { useEffect, useState } from 'react';
import { Star, Clock, PhoneCall, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { billingApi } from '../../../../api/billing';

const PlanOverview: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-center min-h-[160px] rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="animate-spin text-blue-electric" size={24} />
          </div>
        ))}
      </div>
    );
  }

  const hasSubscription = subscription && subscription.status === 'active';
  const plan = subscription?.plan || { name: 'NO ACTIVE PLAN', price_amount: 0, limits: { ai_minutes: 0 } };
  const status = subscription?.status || 'inactive';
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const totalMinutes = hasSubscription ? (usage?.total_minutes || plan.limits?.ai_minutes || 0) : 0;
  const usedMinutes = hasSubscription ? (usage?.used_minutes || 0) : 0;
  const remainingMinutes = hasSubscription ? (usage?.remaining_minutes || 0) : 0;
  const remainingPercentage = totalMinutes > 0 ? Math.min(100, Math.max(0, Math.round((remainingMinutes / totalMinutes) * 100))) : 0;
  const overageMinutes = Math.max(0, usedMinutes - totalMinutes);

  // Get overage rate from plan metadata or default to 0.12
  const overageRate = plan.metadata?.overage_rate || '0.12';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Current Plan Card */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 ring-4 ring-blue-50/50">
            <Star size={20} className="fill-blue-600" />
          </div>
          <Link
            to="/dashboard/billing/plans"
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Upgrade Plan <ChevronRight size={10} strokeWidth={3} />
          </Link>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Subscription</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-black tracking-tight ${hasSubscription ? 'text-slate-900' : 'text-slate-400'}`}>
              {plan.name}
            </h3>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {hasSubscription ? (plan.price_amount > 0 ? `$${plan.price_amount / 100}/mo` : 'Free Tier') : 'No active plan'}
          </p>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400">Renewal Date</span>
          <span className={`font-black ${status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
            {status === 'active' ? renewalDate : status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Minute Allowance Card */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50/50">
            <Clock size={20} />
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
            Resets Monthly
          </span>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Usage Allowance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalMinutes.toLocaleString()} Min</h3>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
              <span className={remainingPercentage < 20 ? 'text-rose-500' : 'text-slate-600'}>
                {remainingPercentage}% Left
              </span>
              <span className="text-slate-400">{remainingMinutes} / {totalMinutes} used</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${remainingPercentage < 20 ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                style={{ width: `${remainingPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overage Card */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 ring-4 ring-amber-50/50">
            <PhoneCall size={20} />
          </div>
          {overageMinutes > 0 && (
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-wider animate-pulse">
              Over Limit
            </span>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Extra Usage</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-black tracking-tight ${overageMinutes > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overageMinutes.toLocaleString()} Min
            </h3>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Overage Rate: <span className="text-slate-900 font-bold">${overageRate}/min</span>
          </p>
        </div>

        <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
          <span>*Billed on next cycle</span>
        </div>
      </div>
    </div>
  );
};

export default PlanOverview;
