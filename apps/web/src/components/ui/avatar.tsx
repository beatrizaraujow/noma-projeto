/**
 * Avatar Component
 */
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const backgroundColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % backgroundColors.length
    : 0;

  const bgColor = backgroundColors[colorIndex];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center text-white font-semibold', bgColor)}>
          {initials}
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Group - Multiple avatars
 */
export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
}: {
  avatars: Array<{ src?: string; name?: string; alt?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <div
          key={index}
          className="ring-2 ring-white dark:ring-gray-800 rounded-full"
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div className="ring-2 ring-white dark:ring-gray-800 rounded-full">
          <div
            className={cn(
              'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center font-semibold',
              size === 'xs' && 'w-6 h-6 text-xs',
              size === 'sm' && 'w-8 h-8 text-sm',
              size === 'md' && 'w-10 h-10 text-base',
              size === 'lg' && 'w-12 h-12 text-lg',
              size === 'xl' && 'w-16 h-16 text-xl'
            )}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}
