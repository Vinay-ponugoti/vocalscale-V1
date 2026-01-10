import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-electric focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white',
  {
    variants: {
      variant: {
        default: 'bg-blue-electric text-white hover:bg-blue-dark',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-charcoal-light bg-transparent hover:bg-white-light text-charcoal-medium',
        secondary: 'bg-white text-charcoal border border-charcoal-light hover:bg-white-soft',
        ghost: 'hover:bg-white-light hover:text-charcoal',
        link: 'underline-offset-4 hover:underline text-blue-electric',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
