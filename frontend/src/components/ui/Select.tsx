import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

type SelectContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue>({});

export interface SelectProps extends SelectContextValue {
  children: React.ReactNode;
}

export const Select = ({ children, value, onValueChange }: SelectProps) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div className="relative inline-block w-full">{children}</div>
  </SelectContext.Provider>
);

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium shadow-sm ring-offset-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  ),
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { value, onValueChange } = React.useContext(SelectContext);
  return (
    <select
      aria-label="Select option"
      className={cn('absolute inset-0 h-full w-full cursor-pointer opacity-0', className)}
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  );
};

export const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <option value={value} className={className}>{children}</option>
);
