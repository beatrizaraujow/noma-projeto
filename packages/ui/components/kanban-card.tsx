import * as React from 'react';
import {
  MoreVertical,
  Plus,
  Clock,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Flag,
  Circle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { Button } from './button';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  commentsCount?: number;
  attachmentsCount?: number;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface KanbanCardProps {
  task: KanbanTask;
  onClick?: () => void;
  isDragging?: boolean;
  className?: string;
}

export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ task, onClick, isDragging = false, className, ...props }, ref) => {
    const priorityConfig = {
      low: { icon: Flag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      medium: { icon: Flag, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
      high: { icon: Flag, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
      urgent: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    };

    const priority = task.priority ? priorityConfig[task.priority] : null;
    const PriorityIcon = priority?.icon;

    // Check if due date is overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const isDueSoon = task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 86400000 * 3); // 3 days

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'group relative bg-white dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700',
          'rounded-lg p-3',
          'cursor-pointer',
          'transition-all duration-200',
          isDragging
            ? 'opacity-50 shadow-2xl rotate-2 scale-105'
            : 'hover:shadow-md hover:border-orange-300 dark:hover:border-orange-600',
          className
        )}
        {...props}
      >
        {/* Priority indicator - Left border */}
        {priority && (
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
              priority.bg.replace('bg-', 'bg-gradient-to-b from-').replace('/20', '')
            )}
          />
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 ml-1">
            {task.labels.slice(0, 2).map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs font-medium rounded"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
            {task.labels.length > 2 && (
              <span className="px-2 py-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                +{task.labels.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 pr-6 line-clamp-2">
          {task.title}
        </h4>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-3">
          {/* Left side - Meta info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Priority icon */}
            {priority && PriorityIcon && (
              <div className={cn('flex-shrink-0', priority.color)} title={task.priority}>
                <PriorityIcon className="h-3.5 w-3.5" />
              </div>
            )}

            {/* Due date */}
            {task.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs flex-shrink-0',
                  isOverdue
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : isDueSoon
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              >
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Comments */}
            {task.commentsCount !== undefined && task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                <MessageSquare className="h-3 w-3" />
                <span>{task.commentsCount}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachmentsCount !== undefined && task.attachmentsCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachmentsCount}</span>
              </div>
            )}
          </div>

          {/* Right side - Assignee */}
          {task.assignee && (
            <Avatar
              src={task.assignee.avatar}
              fallback={task.assignee.name}
              size="xs"
              className="flex-shrink-0"
            />
          )}
        </div>

        {/* Drag handle (visible on hover) */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <MoreVertical className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        </div>
      </div>
    );
  }
);

KanbanCard.displayName = 'KanbanCard';

// Placeholder card for drop zones
export const KanbanCardPlaceholder = React.forwardRef<
  HTMLDivElement,
  { className?: string }
>(({ className }, ref) => (
  <div
    ref={ref}
    className={cn(
      'border-2 border-dashed border-orange-300 dark:border-orange-600',
      'rounded-lg p-3 h-24',
      'bg-orange-50/50 dark:bg-orange-900/10',
      className
    )}
  />
));

KanbanCardPlaceholder.displayName = 'KanbanCardPlaceholder';
