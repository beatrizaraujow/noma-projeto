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
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    outline: 'border border-gray-700 text-gray-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium transition-colors',
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
