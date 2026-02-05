import * as React from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Archive,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Play,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Avatar, AvatarGroup } from './avatar';
import { Button } from './button';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';

export interface Project {
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
}

// Project Card
export interface ProjectCardGridProps {
  project: Project;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export const ProjectCardGrid = React.forwardRef<HTMLDivElement, ProjectCardGridProps>(
  ({ project, onClick, onEdit, onDelete, onArchive, onToggleFavorite, className }, ref) => {
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

    const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed';

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-white dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700',
          'rounded-xl p-6',
          'hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600',
          'transition-all duration-200',
          'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={cn(
                  'p-1 rounded transition-colors',
                  project.favorite
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-neutral-300 hover:text-yellow-500'
                )}
              >
                <Star className={cn('h-5 w-5', project.favorite && 'fill-current')} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-1 truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {(onEdit || onDelete || onArchive) && (
            <Dropdown
              trigger={
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              align="end"
            >
              {onEdit && (
                <DropdownItem leftIcon={<Edit className="h-4 w-4" />} onClick={onEdit}>
                  Edit
                </DropdownItem>
              )}
              {onArchive && project.status !== 'archived' && (
                <DropdownItem leftIcon={<Archive className="h-4 w-4" />} onClick={onArchive}>
                  Archive
                </DropdownItem>
              )}
              {onDelete && (
                <>
                  <DropdownSeparator />
                  <DropdownItem leftIcon={<Trash2 className="h-4 w-4" />} onClick={onDelete} danger>
                    Delete
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          )}
        </div>

        {/* Status & Priority */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant={status.color} size="sm">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
          {project.priority && (
            <Badge variant={priorityConfig[project.priority].color} size="sm">
              {priorityConfig[project.priority].label}
            </Badge>
          )}
        </div>

        {/* Progress */}
        {project.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
              <span className="font-medium text-neutral-900 dark:text-white">
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

        {/* Tasks count */}
        {project.tasksCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            <TrendingUp className="h-4 w-4" />
            <span>
              {project.completedTasks || 0} / {project.tasksCount} tasks completed
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {/* Members */}
          {project.members && project.members.length > 0 && (
            <AvatarGroup max={4} size="sm">
              {project.members.map((member, index) => (
                <Avatar
                  key={index}
                  src={member.avatar}
                  fallback={member.name}
                  size="sm"
                />
              ))}
            </AvatarGroup>
          )}

          {/* Due date */}
          {project.dueDate && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs',
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(project.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {isOverdue && <span className="font-medium">(Overdue)</span>}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProjectCardGrid.displayName = 'ProjectCardGrid';

// Project Filters
export interface ProjectFilters {
  status?: Project['status'][];
  priority?: Project['priority'][];
  owner?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface ProjectFiltersBarProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export const ProjectFiltersBar = React.forwardRef<HTMLDivElement, ProjectFiltersBarProps>(
  ({ filters, onFiltersChange, onClearFilters, className }, ref) => {
    const hasActiveFilters = 
      (filters.status && filters.status.length > 0) ||
      (filters.priority && filters.priority.length > 0) ||
      (filters.owner && filters.owner.length > 0) ||
      (filters.dateRange?.from || filters.dateRange?.to);

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-3', className)}>
        {/* Status Filter */}
        <Dropdown
          trigger={
            <Button variant="outline" size="sm">
              Status
              {filters.status && filters.status.length > 0 && (
                <Badge size="sm" variant="primary" className="ml-2">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          }
        >
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                status: filters.status?.includes('active')
                  ? filters.status.filter((s) => s !== 'active')
                  : [...(filters.status || []), 'active'],
              })
            }
            selected={filters.status?.includes('active')}
          >
            Active
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                status: filters.status?.includes('on-hold')
                  ? filters.status.filter((s) => s !== 'on-hold')
                  : [...(filters.status || []), 'on-hold'],
              })
            }
            selected={filters.status?.includes('on-hold')}
          >
            On Hold
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                status: filters.status?.includes('completed')
                  ? filters.status.filter((s) => s !== 'completed')
                  : [...(filters.status || []), 'completed'],
              })
            }
            selected={filters.status?.includes('completed')}
          >
            Completed
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                status: filters.status?.includes('archived')
                  ? filters.status.filter((s) => s !== 'archived')
                  : [...(filters.status || []), 'archived'],
              })
            }
            selected={filters.status?.includes('archived')}
          >
            Archived
          </DropdownItem>
        </Dropdown>

        {/* Priority Filter */}
        <Dropdown
          trigger={
            <Button variant="outline" size="sm">
              Priority
              {filters.priority && filters.priority.length > 0 && (
                <Badge size="sm" variant="primary" className="ml-2">
                  {filters.priority.length}
                </Badge>
              )}
            </Button>
          }
        >
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                priority: filters.priority?.includes('low')
                  ? filters.priority.filter((p) => p !== 'low')
                  : [...(filters.priority || []), 'low'],
              })
            }
            selected={filters.priority?.includes('low')}
          >
            Low
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                priority: filters.priority?.includes('medium')
                  ? filters.priority.filter((p) => p !== 'medium')
                  : [...(filters.priority || []), 'medium'],
              })
            }
            selected={filters.priority?.includes('medium')}
          >
            Medium
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              onFiltersChange({
                ...filters,
                priority: filters.priority?.includes('high')
                  ? filters.priority.filter((p) => p !== 'high')
                  : [...(filters.priority || []), 'high'],
              })
            }
            selected={filters.priority?.includes('high')}
          >
            High
          </DropdownItem>
        </Dropdown>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <XCircle className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    );
  }
);

ProjectFiltersBar.displayName = 'ProjectFiltersBar';
