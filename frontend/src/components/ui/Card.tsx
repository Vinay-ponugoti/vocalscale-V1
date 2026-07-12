import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-[14px] border border-border bg-card text-card-foreground shadow-premium-sm",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-semibold leading-none tracking-[-0.02em] text-foreground",
      className
    )}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

// Note: pt-0 is intentional when used after CardHeader to maintain consistent vertical rhythm 
// without doubling up on vertical space between header and content.
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0 md:p-6 md:pt-0", className)} {...props} />
);

// Note: pt-0 is used here to keep the footer visually connected to the content block.
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-5 pt-0 md:p-6 md:pt-0", className)} {...props} />
);

export default Card;
