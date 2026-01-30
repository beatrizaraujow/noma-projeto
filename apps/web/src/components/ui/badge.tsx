/**
 * Badge Component - For status, priority, and tags
 */
import { cn } from '@/lib/utils';
import { statusVariants, priorityVariants } from '@/lib/design-system';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Status Badge - For task status
 */
export function StatusBadge({ status }: { status: keyof typeof statusVariants }) {
  const variant = statusVariants[status];
  
  return (
    <Badge
      className={cn(
        'border',
        `bg-[${variant.bg}] dark:bg-[${variant.darkBg}]`,
        `text-[${variant.color}] border-[${variant.color}]`
      )}
      style={{
        backgroundColor: variant.bg,
        color: variant.color,
        borderColor: variant.color,
      }}
    >
      {variant.label}
    </Badge>
  );
}

/**
 * Priority Badge - For task priority
 */
export function PriorityBadge({ priority }: { priority: keyof typeof priorityVariants }) {
  const variant = priorityVariants[priority];
  
  return (
    <Badge
      className="border"
      style={{
        color: variant.color,
        borderColor: variant.color,
      }}
    >
      <span className="mr-1">{variant.icon}</span>
      {variant.label}
    </Badge>
  );
}

/**
 * Count Badge - For notifications
 */
export function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-600 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
}
