import * as React from 'react';
import { Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  lastSeen?: Date;
}

export interface PresenceAvatarsProps {
  users: PresenceUser[];
  max?: number;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const AVATAR_COLORS = [
  'ring-orange-500',
  'ring-blue-500',
  'ring-green-500',
  'ring-purple-500',
  'ring-pink-500',
  'ring-yellow-500',
  'ring-red-500',
  'ring-indigo-500',
];

export const PresenceAvatars = React.forwardRef<HTMLDivElement, PresenceAvatarsProps>(
  ({ users, max = 5, showLabel = true, size = 'sm', className }, ref) => {
    const visibleUsers = users.slice(0, max);
    const remainingCount = Math.max(0, users.length - max);

    const sizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
    };

    if (users.length === 0) return null;

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)}>
        {/* Eye icon with pulse animation */}
        <div className="relative">
          <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <span className="absolute inset-0 animate-ping opacity-20">
            <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </span>
        </div>

        {/* Floating avatars stack */}
        <div className="flex -space-x-2">
          {visibleUsers.map((user, index) => (
            <div
              key={user.id}
              className="relative group"
              style={{
                zIndex: visibleUsers.length - index,
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${index * 0.3}s`,
              }}
            >
              <Avatar
                src={user.avatar}
                fallback={user.name}
                size={size}
                className={cn(
                  'ring-2 ring-white dark:ring-neutral-900 transition-transform hover:scale-110',
                  user.color ? `ring-${user.color}` : AVATAR_COLORS[index % AVATAR_COLORS.length]
                )}
              />
              
              {/* Pulse indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {user.name} is viewing
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
              </div>
            </div>
          ))}

          {/* Remaining count */}
          {remainingCount > 0 && (
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium ring-2 ring-white dark:ring-neutral-900',
                sizeClasses[size]
              )}
            >
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Label */}
        {showLabel && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {users.length === 1
              ? `${users[0].name} is viewing`
              : `${users.length} people viewing`}
          </span>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-4px);
            }
          }
        `}} />
      </div>
    );
  }
);

PresenceAvatars.displayName = 'PresenceAvatars';
