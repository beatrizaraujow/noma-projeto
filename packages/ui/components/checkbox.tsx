import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        <div className="flex items-start gap-2">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id={inputId}
              className={cn(
                'peer h-5 w-5 shrink-0 appearance-none rounded border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'checked:bg-primary-500 checked:border-primary-500',
                'dark:border-neutral-600 dark:checked:bg-primary-500',
                error
                  ? 'border-error focus-visible:ring-error'
                  : 'border-neutral-300',
                className
              )}
              ref={ref}
              {...props}
            />
            <Check 
              className={cn(
                'absolute left-0.5 top-0.5 h-4 w-4 text-white pointer-events-none',
                'opacity-0 peer-checked:opacity-100 transition-opacity'
              )}
              strokeWidth={3}
            />
          </div>
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer select-none',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                'text-neutral-700 dark:text-neutral-200'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error pl-7">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 pl-7">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
