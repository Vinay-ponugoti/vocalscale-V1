import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  // Base styles - premium, accessible
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-[10px] text-[13px] font-semibold tracking-[-0.01em]",
    "ring-offset-background transition-[color,background-color,border-color,box-shadow,transform] duration-150",
    // Focus states - accessible
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled states
    "disabled:pointer-events-none disabled:opacity-50",
    // Active state feedback
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "shadow-sm hover:shadow-md",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "shadow-sm",
        ],
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
          "shadow-sm",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
        ],
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ],
        // Premium variants
        premium: [
          "bg-blue-600 text-white",
          "hover:bg-blue-700",
          "shadow-sm hover:shadow-md border border-blue-600",
        ],
        "outline-premium": [
          "border-2 border-primary/20 bg-background/50 backdrop-blur-sm text-primary",
          "hover:bg-primary/5 hover:border-primary/50",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[9px] px-3",
        lg: "h-11 rounded-[10px] px-6",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
