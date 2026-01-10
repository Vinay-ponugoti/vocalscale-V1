import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = ({ className, value = 0, ...props }: ProgressProps) => {
  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-slate-900 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};
