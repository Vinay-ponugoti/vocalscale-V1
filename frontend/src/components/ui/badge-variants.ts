import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
    [
        "inline-flex items-center rounded-full border px-2.5 py-0.5",
        "text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    ],
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border-border hover:bg-accent",
                // Status variants - premium look
                success: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
                warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
                error: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
                info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
                // Subtle variants
                "subtle-primary": "border-transparent bg-primary/10 text-primary",
                "subtle-secondary": "border-transparent bg-muted text-muted-foreground",
            },
            size: {
                default: "px-2.5 py-0.5 text-xs",
                sm: "px-2 py-0.5 text-[10px]",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);
