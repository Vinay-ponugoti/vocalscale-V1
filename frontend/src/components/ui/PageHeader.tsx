import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons/filters shown on the right (below the title on mobile). */
  actions?: React.ReactNode;
  /** Small inline element after the title, e.g. a count badge. */
  meta?: React.ReactNode;
  className?: string;
}

/** The one page title block used by every signed-in page. */
export const PageHeader = ({ title, description, actions, meta, className }: PageHeaderProps) => (
  <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {meta}
      </div>
      {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
