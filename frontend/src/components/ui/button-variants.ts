import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  // Base styles - premium, accessible
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-lg text-sm font-semibold",
    "ring-offset-background transition-all duration-200",
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
          "shadow-sm hover:shadow-glow-blue",
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
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
          "hover:from-blue-700 hover:to-indigo-700",
          "shadow-md hover:shadow-glow-blue border border-transparent",
        ],
        "outline-premium": [
          "border-2 border-primary/20 bg-background/50 backdrop-blur-sm text-primary",
          "hover:bg-primary/5 hover:border-primary/50",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
