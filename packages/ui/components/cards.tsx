import * as React from 'react';
import { MoreVertical, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Avatar } from './avatar';
import { Button } from './button';

// Base Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-white dark:bg-neutral-800 transition-all duration-200',
          {
            'border border-neutral-200 dark:border-neutral-700': variant === 'bordered',
            'shadow-md': variant === 'elevated',
            'hover:shadow-lg hover:-translate-y-0.5': hoverable,
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4': padding === 'md',
            'p-6': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Project Card Component
export interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'on-hold' | 'completed' | 'archived';
  progress?: number;
  members?: Array<{ id: string; name: string; avatar?: string }>;
  tasksCount?: number;
  dueDate?: Date;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ 
    name, 
    description, 
    status = 'active',
    progress = 0,
    members = [],
    tasksCount = 0,
    dueDate,
    onEdit,
    onDelete,
    onClick,
    className,
    ...props 
  }, ref) => {
    const statusColors = {
      active: 'success',
      'on-hold': 'warning',
      completed: 'info',
      archived: 'neutral',
    } as const;

    const isOverdue = dueDate && new Date(dueDate) < new Date();

    return (
      <Card
        ref={ref}
        variant="bordered"
        padding="md"
        hoverable
        className={cn('cursor-pointer', className)}
        onClick={onClick}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={statusColors[status]} size="sm">
              {status}
            </Badge>
            {(onEdit || onDelete) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open menu
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {/* Members */}
            {members.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      src={member.avatar}
                      fallback={member.name}
                      size="xs"
                      className="ring-2 ring-white dark:ring-neutral-800"
                    />
                  ))}
                </div>
                {members.length > 3 && (
                  <span className="text-xs text-neutral-500">+{members.length - 3}</span>
                )}
              </div>
            )}

            {/* Tasks Count */}
            {tasksCount > 0 && (
              <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                <CheckCircle className="h-4 w-4" />
                <span>{tasksCount} tasks</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {dueDate && (
            <div className={cn(
              'flex items-center gap-1',
              isOverdue ? 'text-error' : 'text-neutral-600 dark:text-neutral-400'
            )}>
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

// Task Card Component
export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee?: { id: string; name: string; avatar?: string };
  labels?: string[];
  dueDate?: Date;
  comments?: number;
  attachments?: number;
  onClick?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ 
    title, 
    description, 
    status,
    priority,
    assignee,
    labels = [],
    dueDate,
    comments = 0,
    attachments = 0,
    onClick,
    className,
    ...props 
  }, ref) => {
    const statusColors = {
      TODO: 'neutral',
      IN_PROGRESS: 'info',
      IN_REVIEW: 'warning',
      DONE: 'success',
    } as const;

    const priorityColors = {
      LOW: 'info',
      MEDIUM: 'warning',
      HIGH: 'error',
      URGENT: 'error',
    } as const;

    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'DONE';

    return (
      <Card
        ref={ref}
        variant="bordered"
        padding="sm"
        hoverable
        className={cn('cursor-pointer', className)}
        onClick={onClick}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
              {title}
            </h4>
            {description && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-1">
                {description}
              </p>
            )}
          </div>
          {assignee && (
            <Avatar
              src={assignee.avatar}
              fallback={assignee.name}
              size="xs"
            />
          )}
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {labels.slice(0, 3).map((label, idx) => (
              <Badge key={idx} variant="neutral" size="sm">
                {label}
              </Badge>
            ))}
            {labels.length > 3 && (
              <Badge variant="neutral" size="sm">+{labels.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[status]} size="sm">
              {status.replace('_', ' ')}
            </Badge>
            {priority && (
              <Badge variant={priorityColors[priority]} size="sm">
                {priority}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            {dueDate && (
              <span className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-error'
              )}>
                <Clock className="h-3 w-3" />
                {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

TaskCard.displayName = 'TaskCard';

// User Card Component
export interface UserCardProps {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  tasksCount?: number;
  projectsCount?: number;
  onMessage?: () => void;
  onProfile?: () => void;
  className?: string;
}

const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  ({ 
    name, 
    email, 
    avatar,
    role,
    status,
    tasksCount,
    projectsCount,
    onMessage,
    onProfile,
    className,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant="bordered"
        padding="md"
        hoverable
        className={cn('text-center', className)}
        {...props}
      >
        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <Avatar
            src={avatar}
            fallback={name}
            size="xl"
            showStatus={!!status}
            status={status}
          />
        </div>

        {/* Info */}
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          {name}
        </h3>
        {email && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            {email}
          </p>
        )}
        {role && (
          <Badge variant="primary" size="sm" className="mb-3">
            {role}
          </Badge>
        )}

        {/* Stats */}
        {(tasksCount !== undefined || projectsCount !== undefined) && (
          <div className="flex justify-center gap-4 mb-4 text-sm">
            {projectsCount !== undefined && (
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {projectsCount}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">Projects</div>
              </div>
            )}
            {tasksCount !== undefined && (
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {tasksCount}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">Tasks</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(onMessage || onProfile) && (
          <div className="flex gap-2">
            {onMessage && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onMessage}
              >
                Message
              </Button>
            )}
            {onProfile && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={onProfile}
              >
                View Profile
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }
);

UserCard.displayName = 'UserCard';

export { Card, ProjectCard, TaskCard, UserCard };
