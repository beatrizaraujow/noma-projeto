import * as React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle,
  Clock,
  UserPlus,
  UserMinus,
  Paperclip,
  Flag,
  ArrowRight,
  GitBranch,
  Archive,
  Copy,
  Tag,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';

export type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'due_date_changed'
  | 'priority_changed'
  | 'label_added'
  | 'label_removed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'archived'
  | 'duplicated'
  | 'moved';

export interface Activity {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  description: string;
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    taskTitle?: string;
    projectName?: string;
    commentText?: string;
  };
}

export interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showAvatar?: boolean;
  compact?: boolean;
  className?: string;
}

export const ActivityFeed = React.forwardRef<HTMLDivElement, ActivityFeedProps>(
  ({ activities, maxItems, showAvatar = true, compact = false, className }, ref) => {
    const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

    return (
      <div ref={ref} className={cn('space-y-0', className)}>
        {displayActivities.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
              No activity yet
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Activity will appear here as changes are made
            </p>
          </div>
        ) : (
          displayActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              showAvatar={showAvatar}
              compact={compact}
              isLast={index === displayActivities.length - 1}
            />
          ))
        )}
      </div>
    );
  }
);

ActivityFeed.displayName = 'ActivityFeed';

// Activity Item Component
interface ActivityItemProps {
  activity: Activity;
  showAvatar: boolean;
  compact: boolean;
  isLast: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  showAvatar,
  compact,
  isLast,
}) => {
  const getActivityIcon = () => {
    const iconClass = 'h-4 w-4';
    switch (activity.type) {
      case 'created':
        return <Plus className={iconClass} />;
      case 'updated':
        return <Edit className={iconClass} />;
      case 'deleted':
        return <Trash2 className={iconClass} />;
      case 'commented':
        return <MessageSquare className={iconClass} />;
      case 'status_changed':
        return <CheckCircle className={iconClass} />;
      case 'assigned':
        return <UserPlus className={iconClass} />;
      case 'unassigned':
        return <UserMinus className={iconClass} />;
      case 'due_date_changed':
        return <Clock className={iconClass} />;
      case 'priority_changed':
        return <Flag className={iconClass} />;
      case 'label_added':
      case 'label_removed':
        return <Tag className={iconClass} />;
      case 'attachment_added':
      case 'attachment_removed':
        return <Paperclip className={iconClass} />;
      case 'archived':
        return <Archive className={iconClass} />;
      case 'duplicated':
        return <Copy className={iconClass} />;
      case 'moved':
        return <ArrowRight className={iconClass} />;
      default:
        return <GitBranch className={iconClass} />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'created':
        return 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400';
      case 'updated':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400';
      case 'deleted':
      case 'attachment_removed':
      case 'label_removed':
        return 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400';
      case 'commented':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400';
      case 'status_changed':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400';
      case 'assigned':
      case 'unassigned':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400';
      case 'priority_changed':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400';
      case 'due_date_changed':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-950 dark:text-pink-400';
      default:
        return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const renderDescription = () => {
    const { metadata } = activity;
    const parts: React.ReactNode[] = [];

    // Split description by placeholders and format
    const text = activity.description;
    
    if (metadata?.field && metadata?.oldValue !== undefined && metadata?.newValue !== undefined) {
      // Format field changes
      parts.push(
        <span key="desc" className="text-neutral-700 dark:text-neutral-300">
          {text.split('from')[0]}
          <span className="font-medium">from</span>
          {' '}
          <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">
            {metadata.oldValue}
          </span>
          {' '}
          <span className="font-medium">to</span>
          {' '}
          <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">
            {metadata.newValue}
          </span>
        </span>
      );
    } else if (metadata?.commentText) {
      // Format comments
      parts.push(
        <span key="desc" className="text-neutral-700 dark:text-neutral-300">
          {text}
          <span className="block mt-1 pl-3 border-l-2 border-neutral-200 dark:border-neutral-700 text-sm italic text-neutral-600 dark:text-neutral-400">
            "{metadata.commentText}"
          </span>
        </span>
      );
    } else {
      parts.push(
        <span key="desc" className="text-neutral-700 dark:text-neutral-300">
          {text}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className={cn('relative flex gap-3', compact ? 'py-2' : 'py-3')}>
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative flex-shrink-0 flex items-center justify-center',
          'w-8 h-8 rounded-full',
          getActivityColor()
        )}
      >
        {getActivityIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className={cn('flex items-start gap-2', compact ? 'mb-0.5' : 'mb-1')}>
          {showAvatar && (
            <Avatar
              src={activity.user.avatar}
              fallback={activity.user.name}
              size="xs"
              className="flex-shrink-0 mt-0.5"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-sm text-neutral-900 dark:text-white">
                {activity.user.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">
                {getRelativeTime(activity.timestamp)}
              </span>
            </div>
            <div className={cn('text-sm', compact ? 'mt-0' : 'mt-0.5')}>
              {renderDescription()}
            </div>
            {activity.metadata?.taskTitle && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium">{activity.metadata.taskTitle}</span>
                  {activity.metadata.projectName && (
                    <>
                      <span>•</span>
                      <span>{activity.metadata.projectName}</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
