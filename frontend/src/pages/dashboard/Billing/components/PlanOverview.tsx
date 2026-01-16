import React, { useEffect, useState } from 'react';
import { Star, Clock, PhoneCall, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { billingApi } from '../../../../api/billing';
import { Card, CardContent } from '../../../../components/ui/Card';

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
          <Card key={i} className="border-none shadow-xl shadow-charcoal/5 min-h-[140px] flex items-center justify-center">
            <Loader2 className="animate-spin text-charcoal-light" size={20} />
          </Card>
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
      <Card className="border-none shadow-xl shadow-charcoal/5 group hover:shadow-charcoal/10 transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full gap-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Star size={18} className="fill-blue-600" />
            </div>
            <Link
              to="/dashboard/billing/plans"
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Upgrade <ChevronRight size={10} strokeWidth={3} />
            </Link>
          </div>

          <div>
            <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">Active Plan</p>
            <h3 className={`text-xl font-black tracking-tight ${hasSubscription ? 'text-charcoal' : 'text-charcoal-light'}`}>
              {plan.name}
            </h3>
            <p className="text-xs font-bold text-charcoal-light mt-0.5">
              {hasSubscription ? (plan.price_amount > 0 ? `$${plan.price_amount / 100}/mo` : 'Free Tier') : 'No active plan'}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-white-light flex justify-between items-center text-[10px]">
            <span className="font-bold text-charcoal-light uppercase tracking-wider">Renews</span>
            <span className={`font-black tracking-wide ${status === 'active' ? 'text-charcoal' : 'text-charcoal-light'}`}>
              {status === 'active' ? renewalDate : '-'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Minute Allowance Card */}
      <Card className="border-none shadow-xl shadow-charcoal/5 group hover:shadow-charcoal/10 transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full gap-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Clock size={18} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">Minutes Allowance</p>
            <h3 className="text-xl font-black text-charcoal tracking-tight">{totalMinutes.toLocaleString()} Min</h3>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                <span className={remainingPercentage < 20 ? 'text-rose-500' : 'text-charcoal-medium'}>
                  {remainingPercentage}% Left
                </span>
                <span className="text-charcoal-light">{remainingMinutes} remaining</span>
              </div>
              <div className="h-1.5 w-full bg-white-light rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${remainingPercentage < 20 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                  style={{ width: `${remainingPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overage Card */}
      <Card className="border-none shadow-xl shadow-charcoal/5 group hover:shadow-charcoal/10 transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full gap-5">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <PhoneCall size={18} />
            </div>
            {overageMinutes > 0 && (
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Over Limit
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black text-charcoal-light uppercase tracking-widest mb-1">Extra Usage</p>
            <h3 className={`text-xl font-black tracking-tight ${overageMinutes > 0 ? 'text-rose-600' : 'text-charcoal'}`}>
              {overageMinutes.toLocaleString()} Min
            </h3>
            <p className="text-xs font-bold text-charcoal-light mt-0.5">
              Rate: <span className="text-charcoal">${overageRate}/min</span>
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-white-light flex justify-between items-center text-[10px]">
            <span className="font-bold text-charcoal-light uppercase tracking-wider">Status</span>
            <span className="font-black text-charcoal tracking-wide">
              {overageMinutes > 0 ? 'Billed Next Cycle' : 'Within Limit'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanOverview;
