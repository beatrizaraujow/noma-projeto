import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Spinner Component
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'neutral';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    const variantClasses = {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      neutral: 'text-neutral-400',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Skeleton Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular', 
    width,
    height,
    animate = true,
    style,
    ...props 
  }, ref) => {
    const variantClasses = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-neutral-200 dark:bg-neutral-700',
          animate && 'animate-pulse',
          variantClasses[variant],
          className
        )}
        style={{
          width: width || (variant === 'circular' ? '40px' : '100%'),
          height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '1rem' : '80px'),
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Loading Overlay Component
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  text?: string;
  spinnerSize?: SpinnerProps['size'];
  backdrop?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className,
    loading = true,
    text = 'Loading...',
    spinnerSize = 'lg',
    backdrop = true,
    children,
    ...props 
  }, ref) => {
    if (!loading) return <>{children}</>;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div 
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center gap-4',
            backdrop && 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm'
          )}
        >
          <Spinner size={spinnerSize} />
          {text && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Skeleton Group for common patterns
export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '80%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('space-y-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg', className)}>
    <Skeleton variant="rectangular" height="200px" />
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

export const SkeletonAvatar = ({ withText = false, className }: { withText?: boolean; className?: string }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <Skeleton variant="circular" width="40px" height="40px" />
    {withText && (
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="120px" />
        <Skeleton variant="text" width="80px" />
      </div>
    )}
  </div>
);

export { Spinner, Skeleton, LoadingOverlay };
