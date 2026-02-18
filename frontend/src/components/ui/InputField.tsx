import React, { useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  containerClassName?: string;
  error?: string;
  hint?: string;
}

const InputField: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  className, 
  containerClassName,
  error,
  hint,
  id,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={cn("mb-4 group", containerClassName)}>
      <label 
        htmlFor={inputId}
        className={cn(
          "block text-sm font-medium mb-1.5 transition-colors duration-200",
          "text-muted-foreground group-focus-within:text-primary",
          error && "text-destructive"
        )}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div 
            className={cn(
              "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200",
              "text-muted-foreground group-focus-within:text-primary",
              error && "text-destructive"
            )}
            aria-hidden="true"
          >
            <Icon size={18} />
          </div>
        )}
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            // Base styles
            "w-full py-2.5 text-sm rounded-lg transition-all duration-200",
            "bg-background text-foreground placeholder:text-muted-foreground",
            // Border
            "border border-input",
            // Focus states - accessible
            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary",
            // Hover
            "hover:border-primary/50",
            // Padding
            Icon ? 'pl-10' : 'pl-3',
            isPassword ? 'pr-10' : 'pr-3',
            // Error state
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200",
              "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:text-primary"
            )}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {/* Error message */}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputField;
