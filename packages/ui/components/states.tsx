import * as React from 'react';
import { 
  FolderOpen, 
  FileX, 
  Search, 
  Inbox, 
  AlertCircle,
  XCircle,
  AlertTriangle,
  Ban,
  WifiOff,
  ServerCrash,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

// Empty State Component
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'files' | 'inbox';
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    icon, 
    title, 
    description, 
    action, 
    secondaryAction,
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const defaultIcons = {
      default: <FolderOpen className="h-16 w-16" />,
      search: <Search className="h-16 w-16" />,
      files: <FileX className="h-16 w-16" />,
      inbox: <Inbox className="h-16 w-16" />,
    };

    const displayIcon = icon || defaultIcons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          'py-12 px-4',
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className="mb-4 text-neutral-400 dark:text-neutral-600">
          {displayIcon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Button
                variant="primary"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

// Error State Component
export interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  error?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: '404' | '500' | '403' | 'network' | 'generic';
  showDetails?: boolean;
  className?: string;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ 
    icon, 
    title, 
    description, 
    error,
    action, 
    secondaryAction,
    variant = 'generic',
    showDetails = false,
    className,
    ...props 
  }, ref) => {
    const [detailsExpanded, setDetailsExpanded] = React.useState(false);

    const defaultIcons = {
      '404': <Search className="h-16 w-16" />,
      '500': <ServerCrash className="h-16 w-16" />,
      '403': <Ban className="h-16 w-16" />,
      'network': <WifiOff className="h-16 w-16" />,
      'generic': <AlertCircle className="h-16 w-16" />,
    };

    const defaultTitles = {
      '404': 'Page Not Found',
      '500': 'Internal Server Error',
      '403': 'Access Denied',
      'network': 'Network Error',
      'generic': 'Something Went Wrong',
    };

    const defaultDescriptions = {
      '404': "The page you're looking for doesn't exist or has been moved.",
      '500': 'An unexpected error occurred on our servers. Please try again later.',
      '403': "You don't have permission to access this resource.",
      'network': 'Please check your internet connection and try again.',
      'generic': 'An error occurred while processing your request.',
    };

    const displayIcon = icon || defaultIcons[variant];
    const displayTitle = title || defaultTitles[variant];
    const displayDescription = description || defaultDescriptions[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          'py-12 px-4',
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className="mb-4 text-error">
          {displayIcon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {displayTitle}
        </h3>

        {/* Description */}
        {displayDescription && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
            {displayDescription}
          </p>
        )}

        {/* Error Details */}
        {error && showDetails && (
          <div className="mb-6 w-full max-w-2xl">
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-2"
            >
              {detailsExpanded ? 'Hide' : 'Show'} error details
            </button>
            {detailsExpanded && (
              <div className="mt-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-left">
                <pre className="text-xs text-neutral-700 dark:text-neutral-300 overflow-x-auto whitespace-pre-wrap break-words">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Button
                variant="primary"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

// Inline Error Component (for forms, inputs, etc)
export interface InlineErrorProps {
  message: string;
  icon?: React.ReactNode;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const InlineError = React.forwardRef<HTMLDivElement, InlineErrorProps>(
  ({ message, icon, variant = 'error', className, ...props }, ref) => {
    const defaultIcons = {
      error: <XCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <AlertCircle className="h-4 w-4" />,
    };

    const variantClasses = {
      error: 'bg-error-light text-error-dark dark:bg-red-900/20 dark:text-red-400',
      warning: 'bg-warning-light text-warning-dark dark:bg-yellow-900/20 dark:text-yellow-400',
      info: 'bg-info-light text-info-dark dark:bg-blue-900/20 dark:text-blue-400',
    };

    const displayIcon = icon || defaultIcons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-2 p-3 rounded-lg text-sm',
          variantClasses[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <span className="flex-shrink-0 mt-0.5">{displayIcon}</span>
        <span className="flex-1">{message}</span>
      </div>
    );
  }
);

InlineError.displayName = 'InlineError';

// Banner Error Component (for page-level errors)
export interface ErrorBannerProps {
  message: string;
  title?: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ErrorBanner = React.forwardRef<HTMLDivElement, ErrorBannerProps>(
  ({ 
    message, 
    title,
    variant = 'error', 
    dismissible = false,
    onDismiss,
    action,
    className, 
    ...props 
  }, ref) => {
    const variantStyles = {
      error: 'bg-error-light border-error dark:bg-red-900/20 dark:border-red-800',
      warning: 'bg-warning-light border-warning dark:bg-yellow-900/20 dark:border-yellow-800',
      info: 'bg-info-light border-info dark:bg-blue-900/20 dark:border-blue-800',
      success: 'bg-success-light border-success dark:bg-green-900/20 dark:border-green-800',
    };

    const iconStyles = {
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info',
      success: 'text-success',
    };

    const icons = {
      error: <XCircle className="h-5 w-5" />,
      warning: <AlertTriangle className="h-5 w-5" />,
      info: <AlertCircle className="h-5 w-5" />,
      success: <AlertCircle className="h-5 w-5" />,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          variantStyles[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <span className={cn('flex-shrink-0 mt-0.5', iconStyles[variant])}>
          {icons[variant]}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {message}
          </p>
          {action && (
            <Button
              variant="link"
              size="sm"
              onClick={action.onClick}
              className="mt-2 p-0 h-auto"
            >
              {action.label}
            </Button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

ErrorBanner.displayName = 'ErrorBanner';

export { EmptyState, ErrorState, InlineError, ErrorBanner };
