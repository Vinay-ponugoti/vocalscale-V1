import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </div>
    );
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'fixed inset-y-0 right-0 z-50 bg-white shadow-xl border-l border-border',
                'w-full sm:max-w-md',
                'flex flex-col',
                'animate-in slide-in-from-right duration-300',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
SheetContent.displayName = 'SheetContent';

export const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('px-6 py-4', className)} {...props} />
);

export const SheetTitle = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={cn('text-lg font-semibold text-foreground', className)}
        {...props}
    />
);

export const SheetDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('px-6 py-4 flex justify-end gap-2', className)}
        {...props}
    />
);

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    children?: React.ReactNode;
}

export const SheetClose = ({ asChild, children, className, onClick, ...props }: SheetCloseProps) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            onClick: (e: React.MouseEvent) => {
                (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.onClick?.(e as never);
                onClick?.(e as never);
            },
        });
    }
    return (
        <button
            className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none',
                className
            )}
            {...props}
            onClick={onClick}
        >
            {children || <X className="h-4 w-4" />}
        </button>
    );
};
