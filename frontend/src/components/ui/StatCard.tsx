import React from 'react';
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StatTint = 'blue' | 'rose' | 'amber' | 'orange' | 'emerald' | 'slate';

const ICON_TINTS: Record<StatTint, string> = {
  blue: 'bg-blue-50 text-blue-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  orange: 'bg-orange-50 text-orange-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-500',
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tint?: StatTint;
  trend?: { value: number; isPositive: boolean };
  /** Suffix after the trend number; '%' by default, '' for absolute deltas. */
  trendSuffix?: string;
  description?: React.ReactNode;
  /** Extra content on the right of the description row (badge, stars…). */
  footer?: React.ReactNode;
  /** Value colour for semantic numbers (e.g. revenue). */
  valueClassName?: string;
  /** Smaller card for header strips. */
  compact?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** The one metric card used across the dashboard. Clickable when onClick is set. */
export const StatCard = ({
  label,
  value,
  icon: Icon,
  tint = 'blue',
  trend,
  trendSuffix = '%',
  description,
  footer,
  valueClassName,
  compact = false,
  active = false,
  onClick,
  className,
}: StatCardProps) => {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex h-full w-full min-w-0 flex-col justify-between rounded-xl border bg-white text-left shadow-sm transition',
        compact ? 'p-3' : 'min-h-[112px] p-4',
        active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="truncate text-[11px] font-semibold uppercase leading-5 tracking-wider text-slate-500">{label}</span>
        {Icon && !compact && (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', ICON_TINTS[tint])}>
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </span>
        )}
      </div>
      <div className={cn('min-w-0', compact ? 'mt-1' : 'mt-3')}>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'truncate font-semibold leading-none tracking-tight text-slate-950',
              compact ? 'text-lg' : 'text-[26px]',
              valueClassName,
            )}
          >
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'flex shrink-0 items-center gap-0.5 text-xs font-semibold',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value)}{trendSuffix}
            </span>
          )}
        </div>
        {(description || footer) && (
          <div className="mt-1.5 flex min-h-5 items-center justify-between gap-2">
            {description && <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{description}</span>}
            {footer}
          </div>
        )}
      </div>
    </Comp>
  );
};

export default StatCard;
