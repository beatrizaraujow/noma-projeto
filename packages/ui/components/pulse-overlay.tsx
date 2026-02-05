import * as React from 'react';
import { cn } from '../lib/utils';

export interface PulseOverlayProps {
  show: boolean;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'yellow';
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

const colorClasses = {
  orange: 'ring-orange-500 bg-orange-50 dark:bg-orange-950/20',
  blue: 'ring-blue-500 bg-blue-50 dark:bg-blue-950/20',
  green: 'ring-green-500 bg-green-50 dark:bg-green-950/20',
  purple: 'ring-purple-500 bg-purple-50 dark:bg-purple-950/20',
  yellow: 'ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
};

const intensityClasses = {
  subtle: 'ring-1',
  medium: 'ring-2',
  strong: 'ring-4',
};

export const PulseOverlay = React.forwardRef<HTMLDivElement, PulseOverlayProps>(
  (
    {
      show,
      color = 'orange',
      intensity = 'medium',
      duration = 2000,
      children,
      className,
    },
    ref
  ) => {
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
      if (show) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [show, duration]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative transition-all duration-300',
          isAnimating && [
            'animate-pulse',
            colorClasses[color],
            intensityClasses[intensity],
            'rounded-lg',
          ],
          className
        )}
      >
        {children}

        {/* Ping effect overlay */}
        {isAnimating && (
          <div
            className={cn(
              'absolute inset-0 rounded-lg pointer-events-none',
              colorClasses[color],
              intensityClasses[intensity],
              'animate-ping opacity-75'
            )}
            style={{
              animationDuration: `${duration}ms`,
              animationIterationCount: '1',
            }}
          />
        )}
      </div>
    );
  }
);

PulseOverlay.displayName = 'PulseOverlay';

// Hook for triggering pulse animations
export function usePulse() {
  const [pulsingIds, setPulsingIds] = React.useState<Set<string>>(new Set());

  const trigger = React.useCallback((id: string, duration = 2000) => {
    setPulsingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setPulsingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, duration);
  }, []);

  const isPulsing = React.useCallback(
    (id: string) => pulsingIds.has(id),
    [pulsingIds]
  );

  return { trigger, isPulsing };
}
