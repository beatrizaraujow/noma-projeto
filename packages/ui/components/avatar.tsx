import * as React from 'react';
import { User } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'rounded' | 'square';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className,
    src,
    alt = 'Avatar',
    size = 'md',
    variant = 'circle',
    fallback,
    status,
    showStatus = false,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    
    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5 border',
      sm: 'h-2 w-2 border',
      md: 'h-2.5 w-2.5 border-2',
      lg: 'h-3 w-3 border-2',
      xl: 'h-3.5 w-3.5 border-2',
      '2xl': 'h-4 w-4 border-2',
    };

    const statusColors = {
      online: 'bg-success',
      offline: 'bg-neutral-400',
      away: 'bg-warning',
      busy: 'bg-error',
    };

    const variantClasses = {
      circle: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden bg-neutral-200 dark:bg-neutral-700',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <span className="font-medium text-neutral-600 dark:text-neutral-300">
            {getInitials(fallback)}
          </span>
        ) : (
          <User className="h-1/2 w-1/2 text-neutral-400" />
        )}

        {showStatus && status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-white dark:border-neutral-900',
              statusSizeClasses[size],
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  variant?: AvatarProps['variant'];
  children: React.ReactElement<AvatarProps>[];
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 3, size = 'md', variant = 'circle', children, ...props }, ref) => {
    const validChildren = React.Children.toArray(children).filter(
      React.isValidElement
    ) as React.ReactElement<AvatarProps>[];
    
    const displayChildren = max ? validChildren.slice(0, max) : validChildren;
    const remaining = validChildren.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex items-center -space-x-2', className)}
        {...props}
      >
        {displayChildren.map((child, index) =>
          React.cloneElement(child, {
            key: index,
            size,
            variant,
            className: cn(
              'ring-2 ring-white dark:ring-neutral-900',
              child.props.className
            ),
          })
        )}
        {remaining > 0 && (
          <Avatar
            size={size}
            variant={variant}
            fallback={`+${remaining}`}
            className="ring-2 ring-white dark:ring-neutral-900 bg-neutral-300 dark:bg-neutral-600"
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
