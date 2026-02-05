import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  leftIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    removable = false,
    onRemove,
    leftIcon,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors',
          
          // Variant styles
          {
            'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200': 
              variant === 'default',
            'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200': 
              variant === 'primary',
            'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-200': 
              variant === 'secondary',
            'bg-success-light text-success-dark dark:bg-green-900 dark:text-green-200': 
              variant === 'success',
            'bg-warning-light text-warning-dark dark:bg-yellow-900 dark:text-yellow-200': 
              variant === 'warning',
            'bg-error-light text-error-dark dark:bg-red-900 dark:text-red-200': 
              variant === 'error',
            'bg-info-light text-info-dark dark:bg-blue-900 dark:text-blue-200': 
              variant === 'info',
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300': 
              variant === 'neutral',
          },
          
          // Size styles
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Remove"
          >
            <X className={cn(
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-3.5 w-3.5',
              size === 'lg' && 'h-4 w-4',
            )} />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
