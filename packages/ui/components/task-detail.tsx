import * as React from 'react';
import {
  X,
  MoreVertical,
  Calendar,
  User,
  Tag,
  Flag,
  FolderOpen,
  Clock,
  CheckSquare,
  Edit2,
  Check,
  Link as LinkIcon,
  Copy,
  Archive,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar } from './avatar';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from './dropdown';

export interface TaskMetadata {
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  project?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface TaskActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  content?: string;
  changes?: {
    field: string;
    from: string;
    to: string;
  };
}

export interface TaskDetailHeaderProps {
  title: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onEditToggle: () => void;
  onClose: () => void;
  onCopy?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const TaskDetailHeader = React.forwardRef<HTMLDivElement, TaskDetailHeaderProps>(
  (
    {
      title,
      isEditing,
      onTitleChange,
      onEditToggle,
      onClose,
      onCopy,
      onArchive,
      onDelete,
      className,
    },
    ref
  ) => {
    const [editValue, setEditValue] = React.useState(title);

    const handleSave = () => {
      onTitleChange(editValue);
      onEditToggle();
    };

    const handleCancel = () => {
      setEditValue(title);
      onEditToggle();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 p-6 border-b border-neutral-200 dark:border-neutral-700',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 text-2xl font-bold bg-transparent border-b-2 border-orange-500 focus:outline-none text-neutral-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="group flex items-start gap-2">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex-1">
                {title}
              </h2>
              <button
                onClick={onEditToggle}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-opacity"
              >
                <Edit2 className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Actions */}
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            align="end"
          >
            {onCopy && (
              <DropdownItem leftIcon={<Copy className="h-4 w-4" />} onClick={onCopy}>
                Copy link
              </DropdownItem>
            )}
            {onArchive && (
              <DropdownItem leftIcon={<Archive className="h-4 w-4" />} onClick={onArchive}>
                Archive task
              </DropdownItem>
            )}
            {onDelete && (
              <>
                <DropdownSeparator />
                <DropdownItem
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={onDelete}
                  danger
                >
                  Delete task
                </DropdownItem>
              </>
            )}
          </Dropdown>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

TaskDetailHeader.displayName = 'TaskDetailHeader';

export interface TaskMetadataSidebarProps {
  metadata: TaskMetadata;
  onStatusChange: (status: TaskMetadata['status']) => void;
  onPriorityChange: (priority: TaskMetadata['priority']) => void;
  onAssigneeChange: (assignee: TaskMetadata['assignee']) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onLabelsChange: (labels: TaskMetadata['labels']) => void;
  className?: string;
}

export const TaskMetadataSidebar = React.forwardRef<
  HTMLDivElement,
  TaskMetadataSidebarProps
>(({ metadata, onStatusChange, onPriorityChange, className }, ref) => {
  const statusConfig = {
    backlog: { label: 'Backlog', color: 'bg-neutral-500' },
    todo: { label: 'To Do', color: 'bg-blue-500' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-500' },
    review: { label: 'In Review', color: 'bg-purple-500' },
    done: { label: 'Done', color: 'bg-green-500' },
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'text-blue-600 dark:text-blue-400' },
    medium: { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    high: { label: 'High', color: 'text-orange-600 dark:text-orange-400' },
    urgent: { label: 'Urgent', color: 'text-red-600 dark:text-red-400' },
  };

  return (
    <div ref={ref} className={cn('space-y-6', className)}>
      {/* Status */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <CheckSquare className="h-4 w-4" />
          Status
        </label>
        <Dropdown
          trigger={
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <span
                className={cn('w-2 h-2 rounded-full', statusConfig[metadata.status].color)}
              />
              <span className="flex-1 text-left text-sm">
                {statusConfig[metadata.status].label}
              </span>
            </button>
          }
        >
          {Object.entries(statusConfig).map(([key, { label, color }]) => (
            <DropdownItem
              key={key}
              onClick={() => onStatusChange(key as TaskMetadata['status'])}
              selected={metadata.status === key}
            >
              <span className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', color)} />
                {label}
              </span>
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      {/* Assignee */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <User className="h-4 w-4" />
          Assignee
        </label>
        {metadata.assignee ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <Avatar src={metadata.assignee.avatar} fallback={metadata.assignee.name} size="xs" />
            <span className="text-sm text-neutral-900 dark:text-white">
              {metadata.assignee.name}
            </span>
          </div>
        ) : (
          <button className="w-full px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Assign to...
          </button>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <Flag className="h-4 w-4" />
          Priority
        </label>
        <Dropdown
          trigger={
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              {metadata.priority ? (
                <>
                  <Flag className={cn('h-4 w-4', priorityConfig[metadata.priority].color)} />
                  <span className="flex-1 text-left text-sm">
                    {priorityConfig[metadata.priority].label}
                  </span>
                </>
              ) : (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Set priority...
                </span>
              )}
            </button>
          }
        >
          {Object.entries(priorityConfig).map(([key, { label, color }]) => (
            <DropdownItem
              key={key}
              onClick={() => onPriorityChange(key as TaskMetadata['priority'])}
              selected={metadata.priority === key}
            >
              <span className="flex items-center gap-2">
                <Flag className={cn('h-4 w-4', color)} />
                {label}
              </span>
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      {/* Due Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <Calendar className="h-4 w-4" />
          Due Date
        </label>
        {metadata.dueDate ? (
          <div className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <span className="text-sm text-neutral-900 dark:text-white">
              {new Date(metadata.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        ) : (
          <button className="w-full px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Set due date...
          </button>
        )}
      </div>

      {/* Labels */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <Tag className="h-4 w-4" />
          Labels
        </label>
        {metadata.labels && metadata.labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {metadata.labels.map((label) => (
              <Badge
                key={label.id}
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        ) : (
          <button className="w-full px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Add labels...
          </button>
        )}
      </div>

      {/* Project */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          <FolderOpen className="h-4 w-4" />
          Project
        </label>
        {metadata.project ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
            {metadata.project.color && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: metadata.project.color }}
              />
            )}
            <span className="text-sm text-neutral-900 dark:text-white">
              {metadata.project.name}
            </span>
          </div>
        ) : (
          <button className="w-full px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 text-sm text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            Add to project...
          </button>
        )}
      </div>
    </div>
  );
});

TaskMetadataSidebar.displayName = 'TaskMetadataSidebar';

export interface TaskActivityTimelineProps {
  activities: TaskActivity[];
  className?: string;
}

export const TaskActivityTimeline = React.forwardRef<HTMLDivElement, TaskActivityTimelineProps>(
  ({ activities, className }, ref) => {
    const getActivityIcon = (type: TaskActivity['type']) => {
      switch (type) {
        case 'created':
          return <CheckSquare className="h-4 w-4" />;
        case 'updated':
          return <Edit2 className="h-4 w-4" />;
        case 'commented':
          return <LinkIcon className="h-4 w-4" />;
        case 'status_changed':
          return <CheckSquare className="h-4 w-4" />;
        case 'assigned':
          return <User className="h-4 w-4" />;
        default:
          return <Clock className="h-4 w-4" />;
      }
    };

    const getActivityText = (activity: TaskActivity) => {
      switch (activity.type) {
        case 'created':
          return 'created this task';
        case 'updated':
          return 'updated the task';
        case 'commented':
          return 'added a comment';
        case 'status_changed':
          return `changed status from ${activity.changes?.from} to ${activity.changes?.to}`;
        case 'assigned':
          return `assigned this to ${activity.changes?.to}`;
        default:
          return 'updated';
      }
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Activity
        </h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar src={activity.user.avatar} fallback={activity.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {activity.user.name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {getActivityText(activity)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(activity.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                {activity.content && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2">
                    {activity.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TaskActivityTimeline.displayName = 'TaskActivityTimeline';
