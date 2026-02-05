import * as React from 'react';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Share2,
  Settings,
  Star,
  Play,
  CheckCircle2,
  PauseCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Avatar, AvatarGroup } from './avatar';
import { Button } from './button';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';

export interface ProjectHeroProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'on-hold' | 'completed' | 'archived';
    priority?: 'low' | 'medium' | 'high';
    progress?: number;
    owner?: {
      name: string;
      avatar?: string;
    };
    members?: Array<{
      name: string;
      avatar?: string;
    }>;
    tasksCount?: number;
    completedTasks?: number;
    dueDate?: Date;
    createdAt?: Date;
    favorite?: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  onToggleFavorite?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const ProjectHero = React.forwardRef<HTMLDivElement, ProjectHeroProps>(
  ({
    project,
    onEdit,
    onDelete,
    onArchive,
    onShare,
    onSettings,
    onToggleFavorite,
    children,
    className,
  }, ref) => {
    const statusConfig = {
      active: { icon: Play, label: 'Active', color: 'success' as const },
      'on-hold': { icon: PauseCircle, label: 'On Hold', color: 'warning' as const },
      completed: { icon: CheckCircle2, label: 'Completed', color: 'info' as const },
      archived: { icon: Archive, label: 'Archived', color: 'neutral' as const },
    };

    const priorityConfig = {
      low: { label: 'Low', color: 'info' as const },
      medium: { label: 'Medium', color: 'warning' as const },
      high: { label: 'High', color: 'error' as const },
    };

    const status = statusConfig[project.status];
    const StatusIcon = status.icon;

    const isOverdue =
      project.dueDate &&
      new Date(project.dueDate) < new Date() &&
      project.status !== 'completed';

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-to-br from-orange-50 via-white to-red-50',
          'dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800',
          'border-b border-neutral-200 dark:border-neutral-800',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    project.favorite
                      ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
                      : 'text-neutral-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
                  )}
                >
                  <Star className={cn('h-6 w-6', project.favorite && 'fill-current')} />
                </button>
              )}

              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  <span>Projects</span>
                  <span>/</span>
                  <span className="text-neutral-900 dark:text-white font-medium">
                    {project.name}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
                  {project.name}
                </h1>

                {/* Description */}
                {project.description && (
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onShare && (
                <Button variant="outline" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              {onSettings && (
                <Button variant="outline" onClick={onSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {(onEdit || onDelete || onArchive) && (
                <Dropdown
                  trigger={
                    <Button variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  align="end"
                >
                  {onEdit && (
                    <DropdownItem leftIcon={<Edit className="h-4 w-4" />} onClick={onEdit}>
                      Edit project
                    </DropdownItem>
                  )}
                  {onArchive && project.status !== 'archived' && (
                    <DropdownItem leftIcon={<Archive className="h-4 w-4" />} onClick={onArchive}>
                      Archive project
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
                        Delete project
                      </DropdownItem>
                    </>
                  )}
                </Dropdown>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={status.color}>
                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                {status.label}
              </Badge>
              {project.priority && (
                <Badge variant={priorityConfig[project.priority].color}>
                  {priorityConfig[project.priority].label} Priority
                </Badge>
              )}
            </div>

            {/* Owner */}
            {project.owner && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Avatar src={project.owner.avatar} fallback={project.owner.name} size="xs" />
                <span>
                  Owned by <strong className="text-neutral-900 dark:text-white">{project.owner.name}</strong>
                </span>
              </div>
            )}

            {/* Due date */}
            {project.dueDate && (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  isOverdue
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>
                  Due{' '}
                  {new Date(project.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {isOverdue && (
                  <Badge variant="error" size="sm">
                    Overdue
                  </Badge>
                )}
              </div>
            )}

            {/* Created date */}
            {project.createdAt && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Clock className="h-4 w-4" />
                <span>
                  Created{' '}
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Progress */}
            {project.progress !== undefined && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-neutral-900 dark:text-white">Progress</span>
                  </div>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tasks */}
            {project.tasksCount !== undefined && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-neutral-900 dark:text-white">Tasks</span>
                  </div>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {project.completedTasks || 0} / {project.tasksCount}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {project.completedTasks || 0} completed
                </p>
              </div>
            )}

            {/* Team */}
            {project.members && project.members.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-neutral-900 dark:text-white">Team</span>
                  </div>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {project.members.length}
                  </span>
                </div>
                <AvatarGroup max={5} size="sm">
                  {project.members.map((member, index) => (
                    <Avatar key={index} src={member.avatar} fallback={member.name} size="sm" />
                  ))}
                </AvatarGroup>
              </div>
            )}
          </div>

          {/* Additional content */}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    );
  }
);

ProjectHero.displayName = 'ProjectHero';
