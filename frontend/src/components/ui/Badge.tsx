import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: "border-transparent bg-blue-electric text-white hover:bg-blue-dark",
    secondary: "border-transparent bg-white-light text-charcoal hover:bg-white-soft",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-500/80",
    outline: "text-charcoal border-charcoal-light",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-electric focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
