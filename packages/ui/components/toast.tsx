import * as React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends Omit<Toast, 'id'> {
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    colorClass: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100',
  },
  error: {
    icon: XCircle,
    colorClass: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100',
  },
  warning: {
    icon: AlertCircle,
    colorClass: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100',
  },
  info: {
    icon: Info,
    colorClass: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100',
  },
};

export const ToastItem = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ type, title, description, action, onClose, duration = 5000 }, ref) => {
    const config = toastConfig[type];
    const Icon = config.icon;

    React.useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
          'animate-in slide-in-from-right-full',
          config.colorClass
        )}
      >
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />

        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-semibold mb-1', config.titleColor)}>
            {title}
          </h4>
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-2 text-sm font-medium underline hover:no-underline transition-all',
                config.iconColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    );
  }
);

ToastItem.displayName = 'ToastItem';

export interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onRemove, position = 'top-right', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col gap-2 w-full max-w-md pointer-events-none',
          positionClasses[position],
          className
        )}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              type={toast.type}
              title={toast.title}
              description={toast.description}
              action={toast.action}
              duration={toast.duration}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = React.useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'success', title, description });
    },
    [addToast]
  );

  const error = React.useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'error', title, description });
    },
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'warning', title, description });
    },
    [addToast]
  );

  const info = React.useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'info', title, description });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
