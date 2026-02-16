import * as React from 'react';
import { cn } from '../../lib/utils';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, children, className, ...props }: TabsProps) => (
    <div className={cn('', className)} data-value={value} {...props}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<TabsListProps>, {
                    value,
                    onValueChange,
                });
            }
            return child;
        })}
    </div>
);

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
}

export const TabsList = ({ className, children, value, onValueChange, ...props }: TabsListProps) => (
    <div
        className={cn(
            'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
            className
        )}
        role="tablist"
        {...props}
    >
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
                    activeValue: value,
                    onValueChange,
                });
            }
            return child;
        })}
    </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value?: string;
    activeValue?: string;
    onValueChange?: (value: string) => void;
}

export const TabsTrigger = ({
    className,
    value,
    activeValue,
    onValueChange,
    children,
    ...props
}: TabsTriggerProps) => (
    <button
        role="tab"
        aria-selected={activeValue === value}
        data-state={activeValue === value ? 'active' : 'inactive'}
        className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            activeValue === value
                ? 'bg-background text-foreground shadow'
                : 'hover:bg-background/50 hover:text-foreground',
            className
        )}
        onClick={() => value && onValueChange?.(value)}
        {...props}
    >
        {children}
    </button>
);

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    activeValue?: string;
}

export const TabsContent = ({
    className,
    value,
    activeValue,
    children,
    ...props
}: TabsContentProps) => {
    if (activeValue !== value) return null;
    return (
        <div
            role="tabpanel"
            className={cn('mt-2 ring-offset-background focus-visible:outline-none', className)}
            {...props}
        >
            {children}
        </div>
    );
};
