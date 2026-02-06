import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SelectProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
}

export const Select = ({ children, value, onValueChange }: SelectProps) => {
    return (
        <div className="relative inline-block w-full">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<SelectContentProps>, {
                        value,
                        onValueChange
                    })
                }
                return child
            })}
        </div>
    )
}

export const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
))
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
    placeholder?: string
    value?: string
}

export const SelectValue = ({ placeholder, value }: SelectValueProps) => {
    return <span>{value || placeholder}</span>
}

interface SelectContentProps {
    children: React.ReactNode
    className?: string
    value?: string
    onValueChange?: (value: string) => void
}

export const SelectContent = ({ children, className, value, onValueChange }: SelectContentProps) => {
    // Simplification: We use a hidden select for functionality and style the trigger
    // In a real shadcn/ui project, this would be a Radix Popover
    return (
        <select
            className={cn(
                "absolute inset-0 opacity-0 cursor-pointer w-full h-full",
                className
            )}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
        >
            {children}
        </select>
    )
}

interface SelectItemProps {
    value: string
    children: React.ReactNode
    className?: string
}

export const SelectItem = ({ value, children, className }: SelectItemProps) => (
    <option value={value} className={cn("", className)}>
        {children}
    </option>
)
