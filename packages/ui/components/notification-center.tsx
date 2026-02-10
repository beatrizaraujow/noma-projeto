import * as React from 'react';
import { Bell, Check, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Badge } from './badge';

export type NotificationFilter = 'all' | 'unread' | 'mentions' | 'assigned';

export interface Notification {
  id: string;
  type: 'mention' | 'assigned' | 'comment' | 'status' | 'due' | 'invite';
  title: string;
  message: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    projectName?: string;
  };
}

export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount?: number;
  filter?: NotificationFilter;
  onFilterChange?: (filter: NotificationFilter) => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  className?: string;
}

export const NotificationCenter = React.forwardRef<HTMLDivElement, NotificationCenterProps>(
  (
    {
      notifications,
      unreadCount = 0,
      filter = 'all',
      onFilterChange,
      onNotificationClick,
      onMarkAsRead,
      onMarkAllAsRead,
      onClearAll,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Filter notifications
    const filteredNotifications = React.useMemo(() => {
      switch (filter) {
        case 'unread':
          return notifications.filter((n) => !n.read);
        case 'mentions':
          return notifications.filter((n) => n.type === 'mention');
        case 'assigned':
          return notifications.filter((n) => n.type === 'assigned');
        default:
          return notifications;
      }
    }, [notifications, filter]);

    const handleNotificationClick = (notification: Notification) => {
      onNotificationClick?.(notification);
      if (!notification.read) {
        onMarkAsRead?.(notification.id);
      }
    };

    const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
      e.stopPropagation();
      onMarkAsRead?.(notificationId);
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        {/* Bell Icon with Badge */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative p-2 rounded-lg',
            'text-neutral-600 dark:text-neutral-400',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors',
            isOpen && 'bg-neutral-100 dark:bg-neutral-800'
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1',
                'flex items-center justify-center',
                'min-w-5 h-5 px-1',
                'text-xs font-semibold',
                'bg-orange-500 text-white',
                'rounded-full',
                'animate-in zoom-in-50'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute right-0 top-full mt-2',
              'w-96 max-h-[600px]',
              'bg-white dark:bg-neutral-900',
              'border border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-lg',
              'overflow-hidden',
              'animate-in fade-in slide-in-from-top-2',
              'z-50'
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="h-7 text-xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-7 text-xs text-neutral-500"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                {(['all', 'unread', 'mentions', 'assigned'] as NotificationFilter[]).map(
                  (filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => onFilterChange?.(filterOption)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-md',
                        'transition-colors',
                        filter === filterOption
                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      )}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                      {filterOption === 'unread' && unreadCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                    No notifications
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {filter === 'all'
                      ? "You're all caught up!"
                      : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={(e) => handleMarkAsRead(e, notification.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page
                  }}
                  className="w-full text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  See all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

NotificationCenter.displayName = 'NotificationCenter';

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: (e: React.MouseEvent) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
}) => {
  const getTypeIcon = () => {
    const iconClass = 'h-4 w-4';
    switch (notification.type) {
      case 'mention':
        return <span className={cn(iconClass, 'text-blue-500')}>@</span>;
      case 'assigned':
        return <span className={cn(iconClass, 'text-purple-500')}>👤</span>;
      case 'comment':
        return <span className={cn(iconClass, 'text-green-500')}>💬</span>;
      case 'status':
        return <span className={cn(iconClass, 'text-orange-500')}>📋</span>;
      case 'due':
        return <span className={cn(iconClass, 'text-red-500')}>⏰</span>;
      case 'invite':
        return <span className={cn(iconClass, 'text-indigo-500')}>✉️</span>;
      default:
        return <Bell className={cn(iconClass, 'text-neutral-500')} />;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 cursor-pointer',
        'hover:bg-neutral-50 dark:hover:bg-neutral-800',
        'transition-colors',
        !notification.read && 'bg-orange-50/50 dark:bg-orange-950/20'
      )}
    >
      <div className="flex gap-3">
        {/* Type Icon */}
        <div className="flex-shrink-0 mt-1">{getTypeIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">
              {notification.title}
            </p>
            {!notification.read && (
              <button
                onClick={onMarkAsRead}
                className="flex-shrink-0 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="Mark as read"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
            {notification.actor && <span>{notification.actor.name}</span>}
            <span>•</span>
            <span>{getRelativeTime(notification.timestamp)}</span>
            {notification.metadata?.taskTitle && (
              <>
                <span>•</span>
                <span className="truncate">{notification.metadata.taskTitle}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
