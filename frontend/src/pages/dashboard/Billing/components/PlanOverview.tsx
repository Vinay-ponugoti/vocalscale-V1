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

  const hasSubscription = subscription && subscription.status === 'active' && subscription.plans;
  const plan = hasSubscription ? subscription.plans : { name: 'NO ACTIVE PLAN', price_amount: 0, limits: { ai_minutes: 0 } };
  const status = subscription?.status || 'inactive';
  const renewalDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
        
        <div className="flex items-center justify-between relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-electric/10 flex items-center justify-center text-blue-electric group-hover:bg-blue-electric group-hover:text-white transition-all duration-300 shadow-sm ring-1 ring-blue-electric/20">
            <Star size={22} strokeWidth={2.5} />
          </div>
          <Link to="/dashboard/billing/plans" className="text-[10px] font-black uppercase tracking-widest text-blue-electric hover:bg-blue-electric hover:text-white transition-all flex items-center gap-1.5 bg-blue-electric/10 px-3 py-1.5 rounded-xl border border-blue-electric/20 shadow-sm">
            Upgrade <ChevronRight size={12} strokeWidth={3} />
          </Link>
        </div>
        
        <div className="relative z-10 mt-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Plan</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-black tracking-tight ${hasSubscription ? 'text-charcoal' : 'text-slate-400'}`}>
              {plan.name}
            </h3>
            <span className="text-sm font-bold text-slate-400">
              {hasSubscription ? (plan.price_amount > 0 ? `$${plan.price_amount / 100}/mo` : 'Free Forever') : '—'}
            </span>
          </div>
        </div>
        
        <div className="mt-8 pt-4 flex justify-between items-center relative z-10 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {status === 'active' ? 'Next Renewal' : 'Status'}
          </p>
          <span className={`text-[11px] font-black px-3 py-1 rounded-xl ring-1 ${
            status === 'active' 
              ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' 
              : 'bg-slate-50 text-slate-500 ring-slate-500/10'
          }`}>
            {status === 'active' ? renewalDate : status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Minute Allowance Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">

        <div className="flex items-center justify-between relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm ring-1 ring-indigo-500/10">
            <Clock size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Monthly Reset</span>
        </div>
        
        <div className="relative z-10 mt-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Minute Allowance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-charcoal tracking-tight">{totalMinutes.toLocaleString()} Min</h3>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-xl uppercase tracking-widest border border-emerald-100 ring-1 ring-emerald-500/10">Included</span>
          </div>
        </div>
        
        <div className="mt-8 pt-4 relative z-10 border-t border-slate-50">
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
              <span className={remainingPercentage < 20 ? 'text-rose-600' : 'text-charcoal'}>
                {remainingPercentage}% Remaining
              </span>
              <span className="text-slate-400">{remainingMinutes.toLocaleString()} / {totalMinutes.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 ring-1 ring-slate-200/50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  remainingPercentage < 20 ? 'bg-rose-500' : 'bg-blue-electric'
                } shadow-[0_0_12px_rgba(59,130,246,0.3)]`} 
                style={{ width: `${remainingPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overage Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">

        <div className="flex items-center justify-between relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm ring-1 ring-orange-500/10">
            <PhoneCall size={22} strokeWidth={2.5} />
          </div>
          <div className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase border tracking-widest ring-1 ${
            overageMinutes > 0 
              ? 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/20 animate-pulse' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20'
          }`}>
            {overageMinutes > 0 ? 'Limit Exceeded' : 'Within Limits'}
          </div>
        </div>
        
        <div className="relative z-10 mt-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Overage Minutes</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-charcoal tracking-tight">{overageMinutes.toLocaleString()} Min</h3>
            <span className="text-[11px] font-bold text-slate-400 italic">used extra</span>
          </div>
        </div>
        
        <div className="mt-8 pt-4 flex justify-between items-center relative z-10 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overage Rate</p>
          <span className="text-charcoal font-black text-[11px] bg-orange-50 px-3 py-1 rounded-xl border border-orange-100 ring-1 ring-orange-500/10">
            ${overageRate}/min
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanOverview;
