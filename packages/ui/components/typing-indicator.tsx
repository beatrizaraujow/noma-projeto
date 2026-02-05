import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';

export interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface TypingIndicatorProps {
  users: TypingUser[];
  max?: number;
  className?: string;
}

export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ users, max = 3, className }, ref) => {
    const visibleUsers = users.slice(0, max);
    const remainingCount = Math.max(0, users.length - max);

    if (users.length === 0) return null;

    const getUsersText = () => {
      if (users.length === 1) {
        return `${users[0].name} is typing`;
      } else if (users.length === 2) {
        return `${users[0].name} and ${users[1].name} are typing`;
      } else if (users.length === 3) {
        return `${users[0].name}, ${users[1].name}, and ${users[2].name} are typing`;
      } else {
        return `${users[0].name}, ${users[1].name}, and ${users.length - 2} others are typing`;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700',
          'animate-in fade-in slide-in-from-bottom-2',
          className
        )}
      >
        {/* User avatars */}
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar}
              fallback={user.name}
              size="xs"
              className="ring-2 ring-neutral-50 dark:ring-neutral-800"
            />
          ))}
          {remainingCount > 0 && (
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium ring-2 ring-neutral-50 dark:ring-neutral-800">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Typing text */}
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {getUsersText()}
        </span>

        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

TypingIndicator.displayName = 'TypingIndicator';
