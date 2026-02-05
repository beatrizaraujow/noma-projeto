import * as React from 'react';
import {
  Search,
  SlidersHorizontal,
  Share2,
  Users,
  Calendar,
  Plus,
  LayoutGrid,
  List,
  KanbanSquare,
  Download,
  MoreVertical,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { SearchBar } from './search-bar';
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from './dropdown';
import { Badge } from './badge';
import { Avatar, AvatarGroup } from './avatar';

export type BoardView = 'board' | 'list' | 'calendar';

export interface BoardFilter {
  assignees?: string[];
  priorities?: Array<'low' | 'medium' | 'high' | 'urgent'>;
  labels?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

export interface BoardHeaderProps {
  title: string;
  description?: string;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
  filter: BoardFilter;
  onFilterChange: (filter: BoardFilter) => void;
  onShare?: () => void;
  onAddTask?: () => void;
  members?: Array<{
    name: string;
    avatar?: string;
  }>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export const BoardHeader = React.forwardRef<HTMLDivElement, BoardHeaderProps>(
  (
    {
      title,
      description,
      view,
      onViewChange,
      filter,
      onFilterChange,
      onShare,
      onAddTask,
      members,
      searchValue = '',
      onSearchChange,
      className,
    },
    ref
  ) => {
    const hasActiveFilters =
      (filter.assignees && filter.assignees.length > 0) ||
      (filter.priorities && filter.priorities.length > 0) ||
      (filter.labels && filter.labels.length > 0) ||
      filter.dueDate?.from ||
      filter.dueDate?.to;

    const activeFiltersCount =
      (filter.assignees?.length || 0) +
      (filter.priorities?.length || 0) +
      (filter.labels?.length || 0) +
      (filter.dueDate?.from ? 1 : 0) +
      (filter.dueDate?.to ? 1 : 0);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-neutral-800',
          'border-b border-neutral-200 dark:border-neutral-700',
          'p-6 space-y-4',
          className
        )}
      >
        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Members */}
            {members && members.length > 0 && (
              <div className="hidden md:block">
                <AvatarGroup max={4} size="sm">
                  {members.map((member, index) => (
                    <Avatar key={index} src={member.avatar} fallback={member.name} size="sm" />
                  ))}
                </AvatarGroup>
              </div>
            )}

            {/* Share button */}
            {onShare && (
              <Button variant="outline" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}

            {/* Add task button */}
            {onAddTask && (
              <Button
                onClick={onAddTask}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </div>

        {/* Search, Filters & Views */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          {onSearchChange && (
            <div className="w-full sm:w-80">
              <SearchBar
                value={searchValue}
                onValueChange={onSearchChange}
                placeholder="Search tasks..."
                size="sm"
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 flex-1">
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge size="sm" variant="primary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              }
            >
              <DropdownLabel>Filter by</DropdownLabel>

              {/* Priority filter */}
              <DropdownItem
                onClick={() => {
                  const priorities = filter.priorities?.includes('urgent')
                    ? filter.priorities.filter((p) => p !== 'urgent')
                    : [...(filter.priorities || []), 'urgent' as const];
                  onFilterChange({ ...filter, priorities: priorities as Array<'low' | 'medium' | 'high' | 'urgent'> });
                }}
                selected={filter.priorities?.includes('urgent')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Urgent
                </span>
              </DropdownItem>

              <DropdownItem
                onClick={() => {
                  const priorities = filter.priorities?.includes('high')
                    ? filter.priorities.filter((p) => p !== 'high')
                    : [...(filter.priorities || []), 'high' as const];
                  onFilterChange({ ...filter, priorities: priorities as Array<'low' | 'medium' | 'high' | 'urgent'> });
                }}
                selected={filter.priorities?.includes('high')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  High
                </span>
              </DropdownItem>

              <DropdownItem
                onClick={() => {
                  const priorities = filter.priorities?.includes('medium')
                    ? filter.priorities.filter((p) => p !== 'medium')
                    : [...(filter.priorities || []), 'medium' as const];
                  onFilterChange({ ...filter, priorities: priorities as Array<'low' | 'medium' | 'high' | 'urgent'> });
                }}
                selected={filter.priorities?.includes('medium')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Medium
                </span>
              </DropdownItem>

              <DropdownItem
                onClick={() => {
                  const priorities = filter.priorities?.includes('low')
                    ? filter.priorities.filter((p) => p !== 'low')
                    : [...(filter.priorities || []), 'low' as const];
                  onFilterChange({ ...filter, priorities: priorities as Array<'low' | 'medium' | 'high' | 'urgent'> });
                }}
                selected={filter.priorities?.includes('low')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Low
                </span>
              </DropdownItem>

              {hasActiveFilters && (
                <>
                  <DropdownSeparator />
                  <DropdownItem
                    onClick={() => onFilterChange({})}
                  >
                    Clear all filters
                  </DropdownItem>
                </>
              )}
            </Dropdown>

            {/* More actions */}
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
              align="end"
            >
              <DropdownItem leftIcon={<Download className="h-4 w-4" />}>
                Export board
              </DropdownItem>
              <DropdownItem leftIcon={<Users className="h-4 w-4" />}>
                Manage members
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem leftIcon={<Calendar className="h-4 w-4" />}>
                Set due dates
              </DropdownItem>
            </Dropdown>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
            <button
              onClick={() => onViewChange('board')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'board'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
              title="Board view"
            >
              <KanbanSquare className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'list'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'calendar'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
              title="Calendar view"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

BoardHeader.displayName = 'BoardHeader';
