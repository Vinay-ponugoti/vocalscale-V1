import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** 'danger' for load errors. */
  tone?: 'default' | 'danger';
  className?: string;
}

/** The one empty / error state used across the dashboard. */
export const EmptyState = ({ icon: Icon, title, description, action, tone = 'default', className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl',
        tone === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400',
      )}
    >
      <Icon size={22} />
    </div>
    <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
