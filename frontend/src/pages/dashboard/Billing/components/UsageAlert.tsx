import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';

interface Props {
  usedMinutes: number;
  totalMinutes: number;
  overageMinutes?: number;
  estimatedCost?: number;
  billingPeriodStart?: string;
}

/**
 * Proactive plan-usage banner. Renders only when the user is worth warning:
 * projected to exceed, already over, or past 80%. Silent otherwise.
 * The projection linearly extrapolates current usage across the billing cycle.
 */
const UsageAlert = ({ usedMinutes, totalMinutes, overageMinutes = 0, estimatedCost = 0, billingPeriodStart }: Props) => {
  if (!totalMinutes || totalMinutes <= 0) return null;

  const pct = (usedMinutes / totalMinutes) * 100;

  // Linear projection across a ~30-day cycle from the period start.
  let projected = usedMinutes;
  let daysElapsed = 0;
  if (billingPeriodStart) {
    const start = new Date(billingPeriodStart).getTime();
    if (!Number.isNaN(start)) {
      daysElapsed = Math.max(0.5, (Date.now() - start) / 86_400_000);
      const cycleDays = 30;
      projected = daysElapsed > 0 ? (usedMinutes / daysElapsed) * cycleDays : usedMinutes;
    }
  }
  const projectedOverage = Math.max(0, projected - totalMinutes);

  const over = overageMinutes > 0 || usedMinutes >= totalMinutes;
  const willExceed = !over && projectedOverage > 0 && daysElapsed >= 1;
  const nearLimit = !over && !willExceed && pct >= 80;

  if (!over && !willExceed && !nearLimit) return null;

  const tone = over
    ? { bg: 'border-rose-200 bg-rose-50', icon: 'text-rose-600', title: 'text-rose-900', body: 'text-rose-700', Icon: AlertTriangle }
    : willExceed
      ? { bg: 'border-amber-200 bg-amber-50', icon: 'text-amber-600', title: 'text-amber-900', body: 'text-amber-700', Icon: TrendingUp }
      : { bg: 'border-blue-200 bg-blue-50', icon: 'text-blue-600', title: 'text-blue-900', body: 'text-blue-700', Icon: Zap };

  const { Icon } = tone;
  const title = over
    ? `You're over your plan by ${Math.ceil(overageMinutes || usedMinutes - totalMinutes)} minutes`
    : willExceed
      ? `On track to exceed your plan this cycle`
      : `You've used ${Math.round(pct)}% of your minutes`;

  const body = over
    ? `${Math.round(usedMinutes)} of ${totalMinutes} min used${estimatedCost > 0 ? ` — about $${estimatedCost.toFixed(2)} in overage so far` : ''}. Upgrade to avoid further overage charges.`
    : willExceed
      ? `At your current pace you'll reach ~${Math.round(projected)} min by cycle end — about ${Math.ceil(projectedOverage)} over your ${totalMinutes}-min plan.`
      : `${Math.round(usedMinutes)} of ${totalMinutes} min used. A larger plan keeps your cost per minute lower.`;

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${tone.bg}`}>
      <div className="flex flex-1 items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${tone.icon}`}>
          <Icon size={20} />
        </span>
        <div>
          <p className={`text-sm font-semibold ${tone.title}`}>{title}</p>
          <p className={`text-xs ${tone.body}`}>{body}</p>
        </div>
      </div>
      <Link
        to="/dashboard/billing/plans"
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Upgrade plan <ArrowUpRight size={15} />
      </Link>
    </div>
  );
};

export default UsageAlert;
